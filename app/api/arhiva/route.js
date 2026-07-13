import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// GET - Dohvati arhivu potrošenih namirnica
export async function GET() {
  try {
    const arhiva = await prisma.potrosenaNamirnica.findMany({
      orderBy: { potrosenoDatum: 'desc' }
    });
    return NextResponse.json(arhiva);
  } catch (error) {
    return NextResponse.json({ error: 'Greška pri dohvaćanju arhive' }, { status: 500 });
  }
}

// DELETE - Obriši stavku iz arhive
export async function DELETE(request) {
  try {
    const { id } = await request.json();
    await prisma.potrosenaNamirnica.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Greška pri brisanju iz arhive' }, { status: 500 });
  }
}