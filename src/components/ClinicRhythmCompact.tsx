'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { MessageCircle, AlertCircle, ArrowRight } from 'lucide-react'

interface FeaturedQuestion {
  question_text: string
  short_answer: string
  related_blog_slug?: string
}

interface FalseAlarm {
  message_body: string
  supportive_line: string
}

interface ClinicRhythmData {
  date_key: string
  featured_question: FeaturedQuestion | null
  false_alarm: FalseAlarm | null
}

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || ''

export default function ClinicRhythmCompact() {
  const [data, setData] = useState<ClinicRhythmData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`${API_URL}/api/public/clinic-rhythm/today`)
        if (response.ok) {
          const result = await response.json()
          if (result.date_key && (result.featured_question || result.false_alarm)) {
            setData(result)
          }
        }
      } catch (error) {
        console.error('Failed to fetch clinic rhythm:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading || !data || (!data.featured_question && !data.false_alarm)) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="bg-teal-500/5 backdrop-blur-sm border border-teal-400/20 rounded-xl p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">
            Klinik Gündemi
          </span>
        </div>
        
        <div className="space-y-4">
          {/* Featured Question - Compact */}
          {data.featured_question && (
            <div className="flex items-start gap-3">
              <MessageCircle className="w-4 h-4 text-teal-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium">
                  "{data.featured_question.question_text}"
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {data.featured_question.short_answer.substring(0, 100)}
                  {data.featured_question.short_answer.length > 100 && '...'}
                </p>
                {data.featured_question.related_blog_slug && (
                  <Link
                    href={`/saglik-rehberi/${data.featured_question.related_blog_slug}`}
                    className="inline-flex items-center mt-2 text-xs text-teal-400 hover:text-teal-300"
                  >
                    Devamını oku <ArrowRight className="w-3 h-3 ml-1" />
                  </Link>
                )}
              </div>
            </div>
          )}
          
          {/* Divider */}
          {data.featured_question && data.false_alarm && (
            <div className="border-t border-teal-400/10" />
          )}
          
          {/* False Alarm - Compact */}
          {data.false_alarm && (
            <div className="flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-xs text-amber-400 font-medium">Yanlış Alarm</span>
                <p className="text-xs text-gray-400 mt-1">
                  {data.false_alarm.message_body.substring(0, 120)}
                  {data.false_alarm.message_body.length > 120 && '...'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
