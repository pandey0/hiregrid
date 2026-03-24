import { auth } from "./auth";
import { prisma } from "./prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { logger } from "./logger";
import { checkProgramAccess, EffectiveProgramRole } from "./permissions";

/**
 * PRODUCTION SECURITY SHIELD
 * This Higher-Order Function wraps server actions to ensure:
 * 1. Authentication (Session exists)
 * 2. Organization Isolation (User belongs to the org)
 * 3. RBAC (User has required program-level permissions)
 * 4. Audit Logging (Every action is tracked with a Trace ID)
 */

interface ShieldConfig {
  programId?: number;
  requiredRole?: EffectiveProgramRole[];
  auditAction: string;
}

export async function withShield<T>(
  config: ShieldConfig,
  action: (context: { 
    userId: string; 
    organizationId: number; 
    role: EffectiveProgramRole;
    traceId: string;
  }) => Promise<T>
): Promise<T> {
  return await logger.trace(`SHIELD:${config.auditAction}`, {}, async (traceId) => {
    // 1. Authentication Check
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      logger.warn("SHIELD_AUTH_FAILURE", { action: config.auditAction, traceId });
      throw new Error("Unauthorized: No active session");
    }

    // 2. Organization Membership Check
    const membership = await prisma.organizationMember.findFirst({
      where: { userId: session.user.id },
      select: { organizationId: true, role: true }
    });

    if (!membership) {
      logger.warn("SHIELD_ORG_FAILURE", { userId: session.user.id, traceId });
      throw new Error("Unauthorized: Not a member of any organization");
    }

    // 3. Granular RBAC / IDOR Check
    let effectiveRole: EffectiveProgramRole = membership.role === "ADMIN" ? "ADMIN" : "NONE";

    if (config.programId) {
      effectiveRole = await checkProgramAccess(config.programId, session.user.id);
      
      if (effectiveRole === "NONE") {
        logger.warn("SHIELD_IDOR_ATTEMPT", { 
          userId: session.user.id, 
          programId: config.programId, 
          traceId 
        });
        throw new Error("Access Denied: You do not have permission for this program");
      }

      // Check if user has one of the required roles (if specified)
      if (config.requiredRole && !config.requiredRole.includes(effectiveRole)) {
        logger.warn("SHIELD_RBAC_FAILURE", { 
          userId: session.user.id, 
          required: config.requiredRole, 
          actual: effectiveRole,
          traceId 
        });
        throw new Error(`Forbidden: This action requires one of the following roles: ${config.requiredRole.join(", ")}`);
      }
    }

    // 4. Execute protected action
    try {
      return await action({ 
        userId: session.user.id, 
        organizationId: membership.organizationId, 
        role: effectiveRole,
        traceId
      });
    } catch (error) {
      // Errors are already logged by logger.trace, but we can add more context here if needed
      throw error;
    }
  });
}
