import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const stavke = await prisma.shoppingStavka.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(stavke);
  } catch (error) {
    return NextResponse.json(
      { error: "Greška pri dohvaćanju shopping stavki" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { naziv } = await request.json();

    if (!naziv?.trim()) {
      return NextResponse.json(
        { error: "Naziv stavke je obavezan." },
        { status: 400 }
      );
    }

    const stavka = await prisma.shoppingStavka.create({
      data: { naziv: naziv.trim() },
    });

    return NextResponse.json(stavka, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Greška pri dodavanju shopping stavke" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();

    await prisma.shoppingStavka.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Greška pri brisanju shopping stavke" },
      { status: 500 }
    );
  }
}