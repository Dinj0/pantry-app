import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// GET - Dohvati sve namirnice
export async function GET() {
  try {
    const namirnice = await prisma.namirnica.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(namirnice);
  } catch (error) {
    return NextResponse.json({ error: 'Greška pri dohvaćanju namirnica' }, { status: 500 });
  }
}

// POST - Dodaj novu namirnicu
export async function POST(request) {
  try {
    const data = await request.json();
    const namirnica = await prisma.namirnica.create({
      data: {
        naziv: data.naziv,
        trenutnaKolicina: parseInt(data.trenutnaKolicina),
        minKolicina: parseInt(data.minKolicina),
        targetKolicina: parseInt(data.targetKolicina),
        kategorija: data.kategorija,
        lokacija: data.lokacija,
        isLocked: data.isLocked !== undefined ? data.isLocked : true
      }
    });
    return NextResponse.json(namirnica);
  } catch (error) {
    return NextResponse.json({ error: 'Greška pri dodavanju namirnice' }, { status: 500 });
  }
}

// PATCH - Ažuriraj namirnicu (količina, lock status)
export async function PATCH(request) {
  try {
    const { id, ...updateData } = await request.json();
    
    // Provjeri da li količina ide na 0 i da li je unlocked
    if (updateData.trenutnaKolicina === 0) {
      const namirnica = await prisma.namirnica.findUnique({ where: { id } });
      
      if (namirnica && !namirnica.isLocked) {
        // Prebaci u arhivu
        await prisma.potrosenaNamirnica.create({
          data: {
            naziv: namirnica.naziv,
            kategorija: namirnica.kategorija,
            lokacija: namirnica.lokacija
          }
        });
        
        // Obriši iz glavne tablice
        await prisma.namirnica.delete({ where: { id } });
        return NextResponse.json({ archived: true });
      }
    }
    
    // Inače samo ažuriraj
    const updated = await prisma.namirnica.update({
      where: { id },
      data: updateData
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Greška pri ažuriranju' }, { status: 500 });
  }
}

// DELETE - Obriši namirnicu
export async function DELETE(request) {
  try {
    const { id } = await request.json();
    await prisma.namirnica.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Greška pri brisanju' }, { status: 500 });
  }
}