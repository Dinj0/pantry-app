-- CreateTable
CREATE TABLE "Namirnica" (
    "id" SERIAL NOT NULL,
    "ime" TEXT NOT NULL,
    "trenutnaKolicina" INTEGER NOT NULL,
    "minKolicina" INTEGER NOT NULL,
    "ciljanaKolicina" INTEGER NOT NULL,
    "kategorija" TEXT NOT NULL,
    "lokacija" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Namirnica_pkey" PRIMARY KEY ("id")
);
