'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import DashboardHeader from '@/components/DashboardHeader'

function fmtTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  if (sameDay) return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function MessagesPage() {
  const router = useRouter()
  const params = useSearchParams()
  const withId = params.get('with') // CHW prefills mother ID, mother auto-uses linked CHW

  const [profile, setProfile] = useState(null)
  const [myId, setMyId] = useState(null)
  const [peerId, setPeerId] = useState(null)
  const [peerName, setPeerName] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [noChw, setNoChw] = useState(false)
  const [conversations, setConversations] = useState([]) // for CHW multi-thread
  const [activeConvoId, setActiveConvoId] = useState(null) // for CHW: selected mother
  const bottomRef = useRef(null)
  const supabaseRef = useRef(null)
  const channelRef = useRef(null)

  useEffect(() => {
    supabaseRef.current = createClient()
    async function load() {
      const supabase = supabaseRef.current
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setMyId(user.id)

      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(p)

      if (p?.role === 'chw') {
        // Load all mothers assigned to this CHW
        const { data: mothers } = await supabase
          .from('mothers')
          .select('id, profiles(full_name)')
          .eq('linked_chw_id', user.id)

        const threads = (mothers || []).map(m => ({
          id: m.id,
          name: m.profiles?.full_name || 'Mother',
        }))
        setConversations(threads)

        const targetId = withId || threads[0]?.id || null
        setActiveConvoId(targetId)
        if (targetId) {
          const found = threads.find(t => t.id === targetId)
          setPeerId(targetId)
          setPeerName(found?.name || 'Mother')
        }
      } else {
        // Mother: find linked CHW
        const { data: m } = await supabase
          .from('mothers')
          .select('linked_chw_id, chws(id, profiles(full_name))')
          .eq('id', user.id)
          .single()

        if (!m?.linked_chw_id) { setNoChw(true); setLoading(false); return }
        const chwId = m.linked_chw_id
        const chwName = m.chws?.profiles?.full_name || 'Community Health Worker'
        setPeerId(chwId)
        setPeerName(chwName)
      }
      setLoading(false)
    }
    load()
  }, [router, withId])

  // Load messages whenever peerId changes
  useEffect(() => {
    if (!myId || !peerId) return
    loadMessages()
    subscribeToMessages()
    return () => { if (channelRef.current) channelRef.current.unsubscribe() }
  }, [myId, peerId])

  async function loadMessages() {
    const supabase = supabaseRef.current
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(from_id.eq.${myId},to_id.eq.${peerId}),and(from_id.eq.${peerId},to_id.eq.${myId})`)
      .order('created_at', { ascending: true })
    setMessages(data || [])
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)

    // Mark unread
    await supabase.from('messages').update({ read: true })
      .eq('to_id', myId).eq('from_id', peerId).eq('read', false)
  }

  function subscribeToMessages() {
    const supabase = supabaseRef.current
    if (channelRef.current) channelRef.current.unsubscribe()
    channelRef.current = supabase
      .channel(`messages-${myId}-${peerId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const msg = payload.new
        if (
          (msg.from_id === myId && msg.to_id === peerId) ||
          (msg.from_id === peerId && msg.to_id === myId)
        ) {
          setMessages(prev => [...prev, msg])
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80)
        }
      })
      .subscribe()
  }

  async function handleSend(e) {
    e.preventDefault()
    if (!text.trim() || !peerId) return
    setSending(true)
    const supabase = supabaseRef.current
    await supabase.from('messages').insert({ from_id: myId, to_id: peerId, body: text.trim() })
    setText('')
    setSending(false)
  }

  function switchConvo(thread) {
    setActiveConvoId(thread.id)
    setPeerId(thread.id)
    setPeerName(thread.name)
    setMessages([])
  }

  if (loading) return <Loading label="Loading messages…" />

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <DashboardHeader name={profile?.full_name} />

      <div className="max-w-5xl mx-auto w-full px-4 md:px-6 pt-5">
        <Link href={profile?.role === 'chw' ? '/dashboard/chw' : '/dashboard'} className="inline-flex items-center gap-1.5 text-sm font-medium text-navy/50 hover:text-navy transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          Back to Dashboard
        </Link>
      </div>
      <div className="flex flex-1 max-w-5xl mx-auto w-full px-4 md:px-6 py-4 gap-4">

        {/* CHW: conversation list */}
        {profile?.role === 'chw' && conversations.length > 0 && (
          <aside className="w-56 shrink-0 border border-gray-200 rounded-[10px] overflow-hidden self-start">
            <p className="px-4 py-3 text-xs font-bold text-navy/50 border-b border-gray-100">CONVERSATIONS</p>
            {conversations.map(thread => (
              <button key={thread.id} onClick={() => switchConvo(thread)}
                className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors border-b border-gray-100 last:border-0 ${activeConvoId === thread.id ? 'bg-navy/5 text-navy font-bold' : 'text-navy/70 hover:bg-gray-50'}`}>
                {thread.name}
              </button>
            ))}
          </aside>
        )}

        {/* Chat window */}
        <div className="flex-1 flex flex-col border border-gray-200 rounded-[10px] overflow-hidden min-h-[600px]">

          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-navy/10 flex items-center justify-center text-xs font-bold text-navy">
              {peerName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-navy">{peerName || '—'}</p>
              <p className="text-xs text-gray-400">{profile?.role === 'chw' ? 'Patient' : 'Your Community Health Worker'}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3">
            {noChw && (
              <div className="text-center py-16">
                <p className="text-sm font-bold text-navy mb-2">No CHW linked yet</p>
                <p className="text-sm text-gray-400 mb-5">Once a Community Health Worker (Umujyanama w'ubuzima) is linked to your account, they will send you care messages and updates here.</p>
                <a href="/dashboard/find-chw"
                  className="px-5 py-2.5 bg-navy text-white text-sm font-bold rounded-[5px] hover:opacity-90 transition-opacity">
                  Find a CHW
                </a>
              </div>
            )}

            {!noChw && !peerId && (
              <div className="text-center py-16">
                <p className="text-sm text-gray-400">Select a conversation to start messaging.</p>
              </div>
            )}

            {messages.length === 0 && peerId && !noChw && (
              <div className="text-center py-16">
                <p className="text-sm text-gray-400">
                  {profile?.role === 'chw'
                    ? 'No messages yet. Send this mother a care update.'
                    : "No messages yet. Your CHW (Umujyanama w'ubuzima) will reach out to you here."}
                </p>
              </div>
            )}

            {messages.map(msg => {
              const mine = msg.from_id === myId
              return (
                <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] px-4 py-2.5 rounded-[12px] text-sm ${mine ? 'bg-navy text-white rounded-br-[4px]' : 'bg-gray-100 text-navy rounded-bl-[4px]'}`}>
                    <p>{msg.body}</p>
                    <p className={`text-[10px] mt-1 ${mine ? 'text-white/60' : 'text-gray-400'}`}>{fmtTime(msg.created_at)}</p>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input — CHW only */}
          {peerId && !noChw && profile?.role === 'chw' && (
            <form onSubmit={handleSend} className="border-t border-gray-100 px-4 py-4 flex gap-3">
              <input value={text} onChange={e => setText(e.target.value)}
                placeholder="Write a message to this mother…"
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-full text-sm text-navy focus:outline-none focus:border-navy transition-colors"
              />
              <button type="submit" disabled={sending || !text.trim()}
                className="px-5 py-2.5 bg-navy text-white text-sm font-bold rounded-full hover:opacity-90 disabled:opacity-50 transition-opacity">
                Send
              </button>
            </form>
          )}

          {/* Mother view — read only notice */}
          {peerId && !noChw && profile?.role !== 'chw' && (
            <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
              <p className="text-xs font-medium text-gray-400 text-center">
                Your Community Health Worker (Umujyanama w'ubuzima) will send you messages here based on your health updates and visits.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Loading({ label }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-navy border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium text-gray-400">{label}</p>
      </div>
    </div>
  )
}

export default function MessagesPageWrapper() {
  return <Suspense><MessagesPage /></Suspense>
}
