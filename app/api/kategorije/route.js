import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function GET() {
  const kategorije = await prisma.kategorija.findMany({ orderBy: { naziv: 'asc' } });
  return Response.json(kategorije);
}

export async function POST(req) {
  const { naziv } = await req.json();
  const kategorija = await prisma.kategorija.create({ data: { naziv } });
  return Response.json(kategorija);
}

export async function DELETE(req) {
  const { id, novaKategorijaId } = await req.json();

  const stara = await prisma.kategorija.findUnique({ where: { id } });
  const nova = await prisma.kategorija.findUnique({ where: { id: novaKategorijaId } });

  if (!stara || !nova) return Response.json({ error: 'Kategorija ne postoji' }, { status: 400 });

  await prisma.namirnica.updateMany({
    where: { kategorija: stara.naziv },
    data: { kategorija: nova.naziv }
  });

  await prisma.kategorija.delete({ where: { id } });

  return Response.json({ ok: true });
}