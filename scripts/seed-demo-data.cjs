const fs = require('node:fs');
const path = require('node:path');
const { PrismaClient } = require('@prisma/client');

function loadEnvFromRootFile() {
  const envPath = path.resolve(__dirname, '../.env');
  if (!fs.existsSync(envPath)) {
    return;
  }

  const content = fs.readFileSync(envPath, 'utf8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIdx = line.indexOf('=');
    if (separatorIdx === -1) {
      continue;
    }

    const key = line.slice(0, separatorIdx).trim();
    const value = line.slice(separatorIdx + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFromRootFile();

const prisma = new PrismaClient();

const demoProducts = [
  {
    name: 'iPhone 15 Pro',
    description: 'Flagship smartphone with A17 Pro chip and titanium body.',
    price: 1199.0,
    stock: 25,
  },
  {
    name: 'Samsung Galaxy S24',
    description: 'Premium Android smartphone with excellent display and camera.',
    price: 999.0,
    stock: 30,
  },
  {
    name: 'MacBook Air M3 13"',
    description: 'Lightweight laptop for everyday productivity and coding.',
    price: 1299.0,
    stock: 14,
  },
  {
    name: 'Dell XPS 13',
    description: 'Compact ultrabook with high-resolution screen.',
    price: 1149.0,
    stock: 12,
  },
  {
    name: 'Sony WH-1000XM5',
    description: 'Noise-canceling over-ear headphones.',
    price: 399.0,
    stock: 40,
  },
  {
    name: 'AirPods Pro 2',
    description: 'True wireless earbuds with active noise cancellation.',
    price: 249.0,
    stock: 55,
  },
  {
    name: 'Apple Watch Series 9',
    description: 'Smartwatch with fitness and health tracking features.',
    price: 429.0,
    stock: 28,
  },
  {
    name: 'Samsung Galaxy Watch 6',
    description: 'WearOS smartwatch with sleep and workout insights.',
    price: 329.0,
    stock: 24,
  },
  {
    name: 'iPad Air 11"',
    description: 'Thin and powerful tablet for work and entertainment.',
    price: 699.0,
    stock: 20,
  },
  {
    name: 'Kindle Paperwhite',
    description: 'Waterproof e-reader with high-contrast display.',
    price: 159.0,
    stock: 65,
  },
  {
    name: 'Logitech MX Master 3S',
    description: 'Ergonomic wireless mouse for productivity.',
    price: 99.0,
    stock: 70,
  },
  {
    name: 'Keychron K8 Pro',
    description: 'Wireless mechanical keyboard with hot-swappable switches.',
    price: 129.0,
    stock: 45,
  },
];

async function upsertByName(product) {
  const existing = await prisma.product.findFirst({
    where: { name: product.name },
    select: { id: true },
  });

  if (!existing) {
    await prisma.product.create({
      data: {
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
      },
    });
    return 'created';
  }

  await prisma.product.update({
    where: { id: existing.id },
    data: {
      description: product.description,
      price: product.price,
      stock: product.stock,
    },
  });
  return 'updated';
}

async function main() {
  let created = 0;
  let updated = 0;

  for (const product of demoProducts) {
    const result = await upsertByName(product);
    if (result === 'created') {
      created += 1;
    } else {
      updated += 1;
    }
  }

  const totalProducts = await prisma.product.count();
  console.log(`Seed complete. created=${created}, updated=${updated}, total=${totalProducts}`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

