import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// GET - dohvati sve namirnice
export async function GET() {
  try {
    const namirnice = await prisma.namirnica.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(namirnice);
  } catch (error) {
    return NextResponse.json({ error: 'Greška pri dohvaćanju' }, { status: 500 });
  }
}

// POST - dodaj novu namirnicu
export async function POST(request) {
  try {
    const data = await request.json();
    
    const novaNamirnica = await prisma.namirnica.create({
      data: {
        ime: data.ime,
        trenutnaKolicina: Number(data.trenutnaKolicina),
        minKolicina: Number(data.minKolicina),
        ciljanaKolicina: Number(data.ciljanaKolicina),
        kategorija: data.kategorija,
        lokacija: data.lokacija
      }
    });
    
    return NextResponse.json(novaNamirnica);
  } catch (error) {
    return NextResponse.json({ error: 'Greška pri spremanju' }, { status: 500 });
  }
}