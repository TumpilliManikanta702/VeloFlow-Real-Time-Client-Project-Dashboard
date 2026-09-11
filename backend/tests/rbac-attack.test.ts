import { describe, it, expect, vi } from 'vitest';
import { UserRole } from '@prisma/client';
import { authorize } from '../src/middleware/rbac.middleware.js';
import { enforceProjectOwnership, enforceTaskAccess } from '../src/middleware/ownership.middleware.js';
import { prisma } from '../src/config/prisma.js';
import { AppError } from '../src/utils/errors.js';
import { Request, Response, NextFunction } from 'express';

describe('Attack Simulation & RBAC Enforcement Suite', () => {
  const pm1 = { sub: 'pm-1-id', email: 'pm1@velozity.dev', role: UserRole.PROJECT_MANAGER, name: 'Marcus' };
  const pm2 = { sub: 'pm-2-id', email: 'pm2@velozity.dev', role: UserRole.PROJECT_MANAGER, name: 'Elena' };
  const dev1 = { sub: 'dev-1-id', email: 'dev1@velozity.dev', role: UserRole.DEVELOPER, name: 'Alex' };
  const dev2 = { sub: 'dev-2-id', email: 'dev2@velozity.dev', role: UserRole.DEVELOPER, name: 'Priya' };
  const admin = { sub: 'admin-id', email: 'admin@velozity.dev', role: UserRole.ADMIN, name: 'Admin' };

  it('Attack: Developer attempts to call PM endpoint -> BLOCKED with 403 Forbidden', () => {
    const middleware = authorize(UserRole.ADMIN, UserRole.PROJECT_MANAGER);
    const req = { user: dev1 } as unknown as Request;
    const res = {} as unknown as Response;
    let caughtError: any = null;
    const next: NextFunction = (err) => {
      if (err) caughtError = err;
    };

    middleware(req, res, next);
    expect(caughtError).toBeInstanceOf(AppError);
    expect(caughtError?.statusCode).toBe(403);
    expect(caughtError?.code).toBe('FORBIDDEN');
  });

  it("Attack: PM1 attempts to access PM2's Project -> BLOCKED with 403 Forbidden", async () => {
    // Mock prisma findUnique to return a project owned by PM2
    vi.spyOn(prisma.project, 'findUnique').mockResolvedValueOnce({
      id: 'proj-pm2',
      name: 'PM2 Project',
      description: 'Secret',
      clientId: 'client-1',
      createdById: pm2.sub, // Owned by PM2
      createdAt: new Date(),
      updatedAt: new Date(),
      tasks: [],
    } as any);

    const req = { user: pm1, params: { id: 'proj-pm2' }, method: 'PATCH' } as unknown as Request;
    const res = {} as unknown as Response;
    let caughtError: any = null;
    const next: NextFunction = (err) => {
      if (err) caughtError = err;
    };

    await enforceProjectOwnership(req, res, next);
    expect(caughtError).toBeInstanceOf(AppError);
    expect(caughtError?.statusCode).toBe(403);
    expect(caughtError?.message).toContain('You can only access projects you created');
  });

  it("Attack: Developer1 attempts to access Developer2's Task -> BLOCKED with 403 Forbidden", async () => {
    vi.spyOn(prisma.task, 'findUnique').mockResolvedValueOnce({
      id: 'task-dev2',
      projectId: 'proj-1',
      title: 'Dev2 Secret Task',
      description: 'Desc',
      assignedDeveloperId: dev2.sub, // Assigned to Dev 2
      status: 'TODO',
      priority: 'HIGH',
      dueDate: new Date(),
      isOverdue: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      project: { createdById: pm1.sub },
    } as any);

    const req = { user: dev1, params: { id: 'task-dev2' } } as unknown as Request;
    const res = {} as unknown as Response;
    let caughtError: any = null;
    const next: NextFunction = (err) => {
      if (err) caughtError = err;
    };

    await enforceTaskAccess(req, res, next);
    expect(caughtError).toBeInstanceOf(AppError);
    expect(caughtError?.statusCode).toBe(403);
    expect(caughtError?.message).toContain('You can only access tasks assigned to you');
  });

  it('Admin bypasses ownership checks successfully', async () => {
    const req = { user: admin, params: { id: 'proj-pm2' } } as unknown as Request;
    const res = {} as unknown as Response;
    let nextCalled = false;
    const next: NextFunction = (err) => {
      expect(err).toBeUndefined();
      nextCalled = true;
    };

    await enforceProjectOwnership(req, res, next);
    expect(nextCalled).toBe(true);
  });
});
