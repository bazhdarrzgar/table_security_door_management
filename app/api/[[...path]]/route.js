import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017'
const DB_NAME = 'table_manager'

let client = null
let db = null

async function connectDB() {
  if (!client) {
    client = new MongoClient(MONGO_URL)
    await client.connect()
    db = client.db(DB_NAME)
  }
  return db
}

// Initialize default data
const defaultData = {
  tables: [
    {
      name: "0-7 پۆل",
      columns: ["ناو", "ڕەتبە"],
      data: [
        ["یاسین رسول", "ن.ز.١٥"],
        ["ژیوب حاجی", "ن.ز.١٥"],
        ["بەشدار یونس", "ن.ز.٥"],
        ["محەممەد ع.م فارس", "ن.ز.٥"],
        ["شەهید موحسین", "ن.ز.٥"],
        ["هەمرەز رسول", "ن.ز.٥"]
      ]
    },
    {
      name: "0-6 پۆل",
      columns: ["ناو", "ڕەتبە"],
      data: [
        ["محەممەد ع.م ئەمین", "ن.ز.٥"],
        ["ڕێڤاز عاسەم", "ن.ز.٤"],
        ["سیوان حسین", "ن.ز.٥"],
        ["تاران خەلیل", "ن.ز.١٥"],
        ["هانا هەڤاڵ", "ن.ز.٥"],
        ["هاوڕێ قادر", "ن.ز.١٥"]
      ]
    },
    {
      name: "0-5 پۆل",
      columns: ["ناو", "ڕەتبە"],
      data: [
        ["ڕەڤیوان مەریوان - دیاری فەتاح", "ن.ز.٥"],
        ["زانیار ئاحەد - محەمەد والی", "ن.ز.٥"],
        ["هانا حسین - حسین محەمەد", "ن.ز.٥"],
        ["محەمەد کریم - علی عەباس", "ن.ز.٥"],
        ["حسین فایق - یعقوب یاسین", "ن.ز.٦"],
        ["ڕوخسار ئاحەد - هەڵۆیست جمال", "ن.ز.٦"]
      ]
    },
    {
      name: "پۆل نەناسراو",
      columns: ["ناو", "ڕەتبە"],
      data: [
        ["", "ن.ز.٤"],
        ["", "ن.ز.٥"],
        ["", "ن.ز.٥"],
        ["", "ن.ز.٤"],
        ["", "ن.ز.٥"],
        ["", "ن.ز.٦"],
        ["", "ن.ز.٦"]
      ]
    },
    {
      name: "دەركەی فۆرج",
      columns: ["ناو", "ڕەتبە"],
      data: [
        ["شیرکو فاتح", "ن.ز.١٥"],
        ["پێشکەوت خەفور", "ن.ز.١٣"],
        ["محەممەد بەختیار", "ن.ز.٦"],
        ["محەممەد عەبدوڵا", "ن.ز.١٣"],
        ["محەممەد حەمید", "ن.ز.١٥"]
      ]
    },
    {
      name: "مەفەرەزە 5-0",
      columns: ["ناو", "ڕەتبە"],
      data: [
        ["هەریم عوسمان", "ن.ز.٥"],
        ["ئەنفەواد سەلام", "ن.ز.٦"]
      ]
    },
    {
      name: "0-4 پۆل",
      columns: ["ناو", "ڕەتبە"],
      data: [
        ["هێڤار سەردار", "ن.ز.٤"],
        ["دیاری خدر", "ن.ز.٥"]
      ]
    }
  ],
  metadata: {
    "مامۆستا": "بەشدار رزگار",
    "تیم لیدەر": "پیشەوا محەمەد",
    "کات": "٣٠ = ٢ + ٣"
  }
}

export async function GET(request, { params }) {
  try {
    const db = await connectDB()
    const url = new URL(request.url)
    const path = url.pathname.split('/api/')[1] || ''

    if (path === 'tables' || path === '') {
      // Get tables data
      let tablesData = await db.collection('tables').findOne({ type: 'main' })
      
      // If no data exists, initialize with default data
      if (!tablesData) {
        await db.collection('tables').insertOne({
          type: 'main',
          ...defaultData
        })
        tablesData = defaultData
      }

      return NextResponse.json({
        tables: tablesData.tables || [],
        metadata: tablesData.metadata || {}
      })
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request, { params }) {
  try {
    const db = await connectDB()
    const url = new URL(request.url)
    const path = url.pathname.split('/api/')[1] || ''

    if (path === 'tables') {
      const body = await request.json()
      
      // Create new table
      const tablesData = await db.collection('tables').findOne({ type: 'main' })
      if (tablesData) {
        tablesData.tables.push(body)
        await db.collection('tables').updateOne(
          { type: 'main' },
          { $set: { tables: tablesData.tables } }
        )
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const db = await connectDB()
    const url = new URL(request.url)
    const path = url.pathname.split('/api/')[1] || ''

    if (path === 'tables') {
      const body = await request.json()
      const { tableName, data } = body
      
      // Update specific table data
      const tablesData = await db.collection('tables').findOne({ type: 'main' })
      if (tablesData) {
        const tableIndex = tablesData.tables.findIndex(t => t.name === tableName)
        if (tableIndex !== -1) {
          tablesData.tables[tableIndex].data = data
          await db.collection('tables').updateOne(
            { type: 'main' },
            { $set: { tables: tablesData.tables } }
          )
        }
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const db = await connectDB()
    const url = new URL(request.url)
    const path = url.pathname.split('/api/')[1] || ''

    if (path === 'tables') {
      const body = await request.json()
      const { tableName } = body
      
      // Delete table
      const tablesData = await db.collection('tables').findOne({ type: 'main' })
      if (tablesData) {
        tablesData.tables = tablesData.tables.filter(t => t.name !== tableName)
        await db.collection('tables').updateOne(
          { type: 'main' },
          { $set: { tables: tablesData.tables } }
        )
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}