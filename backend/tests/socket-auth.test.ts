import { describe, it, expect, vi } from 'vitest';
import { authorizeAndJoinRoom } from '../src/socket/roomManager.js';
import { prisma } from '../src/config/prisma.js';
import { UserRole } from '@prisma/client';

describe('Socket.IO Room Authorization Suite', () => {
  const adminUser = { sub: 'admin-id', email: 'admin@velozity.dev', role: UserRole.ADMIN, name: 'Admin' };
  const pm1User = { sub: 'pm-1-id', email: 'pm1@velozity.dev', role: UserRole.PROJECT_MANAGER, name: 'Marcus' };
  const devUser = { sub: 'dev-1-id', email: 'dev1@velozity.dev', role: UserRole.DEVELOPER, name: 'Alex' };

  it('allows Admin to join global:admin room', async () => {
    const mockSocket = {
      data: { user: adminUser },
      join: vi.fn(),
    } as any;

    const result = await authorizeAndJoinRoom(mockSocket, 'global:admin');
    expect(result.success).toBe(true);
    expect(mockSocket.join).toHaveBeenCalledWith('global:admin');
  });

  it('blocks Developer from joining global:admin room', async () => {
    const mockSocket = {
      data: { user: devUser },
      join: vi.fn(),
    } as any;

    const result = await authorizeAndJoinRoom(mockSocket, 'global:admin');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Only administrators can subscribe');
    expect(mockSocket.join).not.toHaveBeenCalled();
  });

  it("blocks PM from joining another PM's project room", async () => {
    vi.spyOn(prisma.project, 'findUnique').mockResolvedValueOnce({
      id: 'proj-pm2',
      createdById: 'pm-2-id', // owned by PM2
      tasks: [],
    } as any);

    const mockSocket = {
      data: { user: pm1User },
      join: vi.fn(),
    } as any;

    const result = await authorizeAndJoinRoom(mockSocket, 'project:proj-pm2');
    expect(result.success).toBe(false);
    expect(result.error).toContain('You can only subscribe to projects you created');
    expect(mockSocket.join).not.toHaveBeenCalled();
  });
});
