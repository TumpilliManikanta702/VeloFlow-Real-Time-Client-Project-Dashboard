import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/errors.js';

export class ClientService {
  static async listClients(page = 1, limit = 50) {
    const [total, clients] = await Promise.all([
      prisma.client.count(),
      prisma.client.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          _count: { select: { projects: true } },
        },
      }),
    ]);

    return {
      clients,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getClientById(clientId: string) {
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        projects: {
          select: { id: true, name: true, createdAt: true },
        },
      },
    });

    if (!client) throw AppError.notFound('Client not found');
    return client;
  }

  static async createClient(data: { name: string; email: string; companyName: string }) {
    const existing = await prisma.client.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existing) {
      throw AppError.conflict('Client with this email already exists');
    }

    const client = await prisma.client.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        companyName: data.companyName,
      },
    });

    return client;
  }

  static async updateClient(clientId: string, data: { name?: string; email?: string; companyName?: string }) {
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) throw AppError.notFound('Client not found');

    const updated = await prisma.client.update({
      where: { id: clientId },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.email ? { email: data.email.toLowerCase() } : {}),
        ...(data.companyName ? { companyName: data.companyName } : {}),
      },
    });

    return updated;
  }

  static async deleteClient(clientId: string) {
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) throw AppError.notFound('Client not found');

    await prisma.client.delete({ where: { id: clientId } });
    return { success: true };
  }
}
