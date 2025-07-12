import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'

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

// Default users
const defaultUsers = [
  {
    username: 'admin',
    password: 'admin123',
    name: 'بەڕێوەبەر',
    role: 'admin'
  },
  {
    username: 'user',
    password: 'user123',
    name: 'بەکارهێنەر',
    role: 'user'
  }
]

// Simple authentication middleware
async function authenticate(request) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  const token = authHeader.substring(7)
  const db = await connectDB()
  const session = await db.collection('sessions').findOne({ token })
  
  if (session && new Date() < session.expiresAt) {
    return session.user
  }
  
  return null
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

    // Authentication endpoints
    if (path === 'auth/me') {
      const user = await authenticate(request)
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      return NextResponse.json({ user })
    }

    if (path === 'tables' || path === '') {
      // Check authentication for data access
      const user = await authenticate(request)
      if (!user) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }

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
        metadata: tablesData.metadata || {},
        userRole: user.role
      })
    }

    // Analytics endpoint
    if (path === 'analytics') {
      const user = await authenticate(request)
      if (!user) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }

      const tablesData = await db.collection('tables').findOne({ type: 'main' })
      
      if (!tablesData) {
        return NextResponse.json({
          totalRecords: 0,
          tableCount: 0,
          rankDistribution: {}
        })
      }

      const totalRecords = tablesData.tables.reduce((sum, table) => sum + table.data.length, 0)
      const tableCount = tablesData.tables.length
      
      // Calculate rank distribution
      const rankDistribution = {}
      tablesData.tables.forEach(table => {
        table.data.forEach(row => {
          const rank = row[1]
          rankDistribution[rank] = (rankDistribution[rank] || 0) + 1
        })
      })

      return NextResponse.json({
        totalRecords,
        tableCount,
        rankDistribution,
        tables: tablesData.tables.map(table => ({
          name: table.name,
          recordCount: table.data.length
        }))
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

    // Authentication login endpoint
    if (path === 'auth/login') {
      const body = await request.json()
      const { username, password } = body

      // Find user in default users (in production, this would be from database)
      const user = defaultUsers.find(u => u.username === username && u.password === password)
      
      if (!user) {
        return NextResponse.json({ error: 'نامی بەکارهێنەر یان ووشەی نهێنی هەڵەیە' }, { status: 401 })
      }

      // Create session token
      const token = uuidv4()
      const session = {
        token,
        user: { username: user.username, name: user.name, role: user.role },
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }

      // Store session in database
      await db.collection('sessions').insertOne(session)

      return NextResponse.json({
        token,
        role: user.role,
        name: user.name,
        username: user.username
      })
    }

    if (path === 'tables') {
      // Check authentication for creating tables
      const user = await authenticate(request)
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'تەنها بەڕێوەبەران دەتوانن خشتەی نوێ دروست بکەن' }, { status: 403 })
      }

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

    // Handle drag and drop moves
    if (path === 'tables/move') {
      const user = await authenticate(request)
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'تەنها بەڕێوەبەران دەتوانن تۆمارەکان بگوازنەوە' }, { status: 403 })
      }

      const body = await request.json()
      const { sourceTable, targetTable, rowData } = body
      
      const tablesData = await db.collection('tables').findOne({ type: 'main' })
      if (!tablesData) {
        return NextResponse.json({ error: 'No tables found' }, { status: 404 })
      }

      // Find source and target tables
      const sourceTableIndex = tablesData.tables.findIndex(t => t.name === sourceTable)
      const targetTableIndex = tablesData.tables.findIndex(t => t.name === targetTable)
      
      if (sourceTableIndex === -1 || targetTableIndex === -1) {
        return NextResponse.json({ error: 'Source or target table not found' }, { status: 404 })
      }

      // Remove from source table
      const sourceRowIndex = tablesData.tables[sourceTableIndex].data.findIndex(
        row => row[0] === rowData[0] && row[1] === rowData[1]
      )
      
      if (sourceRowIndex !== -1) {
        tablesData.tables[sourceTableIndex].data.splice(sourceRowIndex, 1)
      }

      // Add to target table
      tablesData.tables[targetTableIndex].data.push(rowData)

      // Update database
      await db.collection('tables').updateOne(
        { type: 'main' },
        { $set: { tables: tablesData.tables } }
      )

      return NextResponse.json({ success: true })
    }

    // Batch operations
    if (path === 'tables/batch') {
      const user = await authenticate(request)
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'تەنها بەڕێوەبەران دەتوانن کردارە کۆمەڵایەتیەکان ئەنجام بدەن' }, { status: 403 })
      }

      const body = await request.json()
      const { operation, tableName, rowIndices } = body
      
      const tablesData = await db.collection('tables').findOne({ type: 'main' })
      if (!tablesData) {
        return NextResponse.json({ error: 'No tables found' }, { status: 404 })
      }

      const tableIndex = tablesData.tables.findIndex(t => t.name === tableName)
      if (tableIndex === -1) {
        return NextResponse.json({ error: 'Table not found' }, { status: 404 })
      }

      if (operation === 'delete') {
        // Sort indices in descending order to avoid index shifting issues
        const sortedIndices = rowIndices.sort((a, b) => b - a)
        sortedIndices.forEach(index => {
          tablesData.tables[tableIndex].data.splice(index, 1)
        })
      }

      await db.collection('tables').updateOne(
        { type: 'main' },
        { $set: { tables: tablesData.tables } }
      )

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

    // Update metadata
    if (path === 'metadata') {
      const body = await request.json()
      
      const tablesData = await db.collection('tables').findOne({ type: 'main' })
      if (tablesData) {
        tablesData.metadata = { ...tablesData.metadata, ...body }
        await db.collection('tables').updateOne(
          { type: 'main' },
          { $set: { metadata: tablesData.metadata } }
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