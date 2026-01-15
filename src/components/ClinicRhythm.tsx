'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { MessageCircle, AlertCircle, ArrowRight } from 'lucide-react'

interface FeaturedQuestion {
  question_text: string
  short_answer: string
  related_blog_slug?: string
  related_blog_title?: string
}

interface FalseAlarm {
  message_title?: string
  message_body: string
  supportive_line: string
}

interface ClinicRhythmData {
  date_key: string
  featured_question: FeaturedQuestion | null
  false_alarm: FalseAlarm | null
}

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || ''

export default function ClinicRhythm({ variant = 'default' }: { variant?: 'default' | 'compact' }) {
  const [data, setData] = useState<ClinicRhythmData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        // First try today's content
        let response = await fetch(`${API_URL}/api/public/clinic-rhythm/today`)
        let result = null
        
        if (response.ok) {
          result = await response.json()
        }
        
        // If no content for today, fallback to latest published
        if (!result?.featured_question && !result?.false_alarm) {
          response = await fetch(`${API_URL}/api/public/clinic-rhythm/latest`)
          if (response.ok) {
            result = await response.json()
          }
        }
        
        // Set data if there's actual content
        if (result?.date_key && (result.featured_question || result.false_alarm)) {
          setData(result)
        }
      } catch (error) {
        console.error('Failed to fetch clinic rhythm:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Don't render if no data or still loading - show empty state instead
  if (loading || !data || (!data.featured_question && !data.false_alarm)) {
    return (
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
            Klinik Ritmi
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Günlük klinik bilgileri yakında yayınlanacak.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
            Klinik Ritmi
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Güncel bilgiler ve destek
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* Featured Question Block */}
          {data.featured_question && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-gray-50 rounded-xl p-6 border border-gray-100"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-teal-600" />
                </div>
                <div className="flex-1">
                  <span className="text-xs font-medium text-teal-600 uppercase tracking-wider">
                    Bugün bize en çok bu soruldu
                  </span>
                  
                  <blockquote className="mt-2">
                    <p className="text-lg font-medium text-gray-800 leading-relaxed">
                      "{data.featured_question.question_text}"
                    </p>
                  </blockquote>
                  
                  <p className="mt-3 text-gray-600 text-sm leading-relaxed">
                    {data.featured_question.short_answer}
                  </p>
                  
                  {data.featured_question.related_blog_slug && (
                    <Link
                      href={`/saglik-rehberi/${data.featured_question.related_blog_slug}`}
                      className="inline-flex items-center mt-4 text-sm text-teal-600 hover:text-teal-700 transition-colors"
                    >
                      Devamı Sağlık Rehberi'nde
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* False Alarm Block */}
          {data.false_alarm && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-amber-50/50 rounded-xl p-6 border border-amber-100/50"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <span className="text-xs font-medium text-amber-600 uppercase tracking-wider">
                    Yanlış Alarm
                  </span>
                  
                  {data.false_alarm.message_title && (
                    <h3 className="mt-2 text-lg font-medium text-gray-800">
                      {data.false_alarm.message_title}
                    </h3>
                  )}
                  
                  <p className="mt-2 text-gray-600 text-sm leading-relaxed">
                    {data.false_alarm.message_body}
                  </p>
                  
                  <p className="mt-3 text-sm text-gray-500 italic">
                    {data.false_alarm.supportive_line}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}
