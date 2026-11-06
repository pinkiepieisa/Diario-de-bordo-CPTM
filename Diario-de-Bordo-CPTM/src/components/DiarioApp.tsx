'use client'

import { useState, useTransition } from 'react'
import { loginAction, logoutAction, signupAction } from '@/app/(frontend)/actions'

type Screen =
  | 'login'
  | 'signup'
  | 'home'
  | 'pilot'
  | 'diary'
  | 'cp'
  | 'cp-listening'
  | 'cp-transcription'
  | 'confirmation'
  | 'saved'
  | 'cco'
  | 'history'
  | 'profile'
  | 'manual'
  | 'checkin'
  | 'chat'

type NavTab = 'home' | 'diary' | 'cp' | 'cco' | 'history' | 'profile'

interface TimelineEntry {
  id: number
  time: string
  type: string
  description: string
  status: 'normal' | 'warning' | 'urgent' | 'cco'
  vagao?: string
}

const C = {
  bg: '#f5f5f5',
  surface: '#ffffff',
  card: '#ffffff',
  primary: '#c8102e',
  primaryHover: '#e8182e',
  primaryDark: '#a00820',
  border: '#e0e0e0',
  muted: '#888888',
  mutedFg: '#555555',
  text: '#1a1a1a',
  textSoft: '#333333',
  coral: '#e05a1e',
  warning: '#d97706',
  warningBg: '#fef3c7',
  success: '#16a34a',
  successBg: '#dcfce7',
  danger: '#c8102e',
  dangerBg: '#fee2e2',
  ccoBlue: '#1d4ed8',
  ccoBlueBg: '#dbeafe',
  navBg: '#ffffff',
  statusBar: '#c8102e',
}

const INITIAL_TIMELINE: TimelineEntry[] = [
  {
    id: 1,
    time: '07:15',
    type: 'Início de serviço',
    description: 'Inspeção de bordo concluída. Trem em condições de operação.',
    status: 'normal',
  },
  {
    id: 2,
    time: '07:48',
    type: 'Falha em porta',
    description:
      'Porta de embarque do vagão 3 com falha no fechamento automático. Operada manualmente.',
    status: 'warning',
    vagao: 'Vagão 3',
  },
  {
    id: 3,
    time: '08:22',
    type: 'Ar-condicionado',
    description: 'Unidade de climatização inoperante no vagão 5. Passageiros orientados.',
    status: 'warning',
    vagao: 'Vagão 5',
  },
  {
    id: 4,
    time: '09:03',
    type: 'Comunicação do CCO',
    description: 'Alteração operacional identificada. Aguardar orientação.',
    status: 'cco',
  },
]

const HISTORY_ENTRIES: TimelineEntry[] = [
  {
    id: 10,
    time: '06:55',
    type: 'Início de serviço',
    description: 'Inspeção noturna concluída. Todos os sistemas verificados.',
    status: 'normal',
  },
  {
    id: 11,
    time: '07:15',
    type: 'Partida',
    description: 'Saída da estação Guaianases dentro do intervalo programado.',
    status: 'normal',
  },
  {
    id: 12,
    time: '07:48',
    type: 'Falha em porta',
    description: 'Porta do vagão 3 com falha no fechamento automático.',
    status: 'warning',
    vagao: 'Vagão 3',
  },
  {
    id: 13,
    time: '08:02',
    type: 'Janela danificada',
    description: 'Vidro de janela com trinca no vagão 2. Área isolada com fita.',
    status: 'warning',
    vagao: 'Vagão 2',
  },
  {
    id: 14,
    time: '08:22',
    type: 'Ar-condicionado',
    description: 'Unidade inoperante no vagão 5. Abertura de ventilação ativada.',
    status: 'warning',
    vagao: 'Vagão 5',
  },
  {
    id: 15,
    time: '08:54',
    type: 'Passageiro enfermo',
    description: 'Solicitação de atendimento médico na estação Patriarca. SAMU acionado.',
    status: 'urgent',
    vagao: 'Vagão 4',
  },
  {
    id: 16,
    time: '09:03',
    type: 'Comunicação do CCO',
    description: 'Alteração operacional identificada. Aguardar orientação.',
    status: 'cco',
  },
]

const CHECKLIST_ITEMS = [
  { id: 1, label: 'Freios de serviço', group: 'Freios' },
  { id: 2, label: 'Freio de estacionamento', group: 'Freios' },
  { id: 3, label: 'Portas de embarque — vagão 1', group: 'Portas' },
  { id: 4, label: 'Portas de embarque — vagão 2', group: 'Portas' },
  { id: 5, label: 'Portas de embarque — vagão 3', group: 'Portas' },
  { id: 6, label: 'Portas de embarque — vagão 4', group: 'Portas' },
  { id: 7, label: 'Portas de embarque — vagão 5', group: 'Portas' },
  { id: 8, label: 'Iluminação interna geral', group: 'Iluminação' },
  { id: 9, label: 'Iluminação de emergência', group: 'Iluminação' },
  { id: 10, label: 'Sinalização de saída de emergência', group: 'Iluminação' },
  { id: 11, label: 'Ar-condicionado — vagões 1–3', group: 'Climatização' },
  { id: 12, label: 'Ar-condicionado — vagões 4–5', group: 'Climatização' },
  { id: 13, label: 'Rádio de bordo CCO', group: 'Comunicação' },
  { id: 14, label: 'Sistema de áudio interno', group: 'Comunicação' },
  { id: 15, label: 'Extintor de incêndio — cabine', group: 'Segurança' },
  { id: 16, label: 'Kit de primeiros socorros', group: 'Segurança' },
]

const MANUAL_ITEMS = [
  {
    title: 'Porta com falha de fechamento',
    steps: [
      'Acione o botão de reset de porta (painel lateral)',
      'Aguarde ciclo de abertura/fechamento completo',
      'Se persistir, opere manualmente e registre ocorrência',
      'Notifique o CCO imediatamente',
    ],
  },
  {
    title: 'Ar-condicionado inoperante',
    steps: [
      'Verifique o disjuntor do vagão afetado (caixa elétrica)',
      'Tente o reset pelo painel de climatização',
      'Abra as ventilações de emergência do vagão',
      'Registre ocorrência e informe passageiros',
    ],
  },
  {
    title: 'Falha no sistema de sinalização',
    steps: [
      'Reduza velocidade imediatamente',
      'Contate o CCO via rádio',
      'Não avance para o próximo bloco sem autorização',
      'Aguarde instruções e registre horário e local',
    ],
  },
  {
    title: 'Passageiro com mal-estar',
    steps: [
      'Solicite passageiros próximos para auxílio',
      'Acione intercomunicação com o agente da plataforma',
      'Ligue para SAMU se necessário (192)',
      'Registre vagão, horário e estação mais próxima',
    ],
  },
  {
    title: 'Vidro ou janela danificada',
    steps: [
      'Isole a área com fita de sinalização',
      'Oriente passageiros a se afastarem',
      'Registre vagão e posição exata',
      'Informe manutenção ao final do serviço',
    ],
  },
  {
    title: 'Perda de comunicação com CCO',
    steps: [
      'Tente rádio de backup',
      'Use telefone fixo na próxima estação',
      'Siga protocolo de operação autônoma',
      'Registre horário da falha e duração',
    ],
  },
]

const CHAT_MESSAGES = [
  {
    id: 1,
    sender: 'CCO',
    text: 'Canal de emergência ativo. Use apenas em situações críticas.',
    time: '07:00',
    mine: false,
  },
  { id: 2, sender: 'JP Silva', text: 'Entendido. Canal monitorado.', time: '07:02', mine: true },
]

function StatusBadge({ status }: { status: TimelineEntry['status'] }) {
  const map = {
    normal: { bg: '#f0f0f0', text: '#555555', border: '#d8d8d8' },
    warning: { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
    urgent: { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
    cco: { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
  }
  const label = { normal: 'Normal', warning: 'Alerta', urgent: 'Urgente', cco: 'CCO' }
  const s = map[status]
  return (
    <span
      className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider"
      style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}
    >
      {label[status]}
    </span>
  )
}

function WaveAnimation({ color = '#c8102e' }: { color?: string }) {
  return (
    <div className="flex items-end justify-center gap-1 h-12">
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <div
          key={i}
          className="w-1.5 rounded-full"
          style={{
            background: color,
            animation: `wave 1.2s ease-in-out infinite`,
            animationDelay: `${i * 0.1}s`,
            height: `${20 + Math.sin(i * 0.8) * 12}px`,
          }}
        />
      ))}
      <style>{`@keyframes wave { 0%, 100% { transform: scaleY(1); opacity: 0.7; } 50% { transform: scaleY(1.8); opacity: 1; } }`}</style>
    </div>
  )
}

function PulseRing({ color = '#c8102e' }: { color?: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            border: `2px solid ${color}`,
            animation: `pulse-ring 2s ease-out infinite`,
            animationDelay: `${i * 0.5}s`,
            width: `${80 + i * 30}px`,
            height: `${80 + i * 30}px`,
            opacity: 0,
          }}
        />
      ))}
      <style>{`@keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 0.6; } 100% { transform: scale(1.4); opacity: 0; } }`}</style>
    </div>
  )
}

export interface AppUser {
  id: string | number
  name: string
  matricula: string
  email: string
}

export default function DiarioApp({ initialUser }: { initialUser: AppUser | null }) {
  const [screen, setScreen] = useState<Screen>(initialUser ? 'home' : 'login')
  const [user, setUser] = useState<AppUser | null>(initialUser)
  const [isAuthPending, startAuthTransition] = useTransition()
  const [activeNav, setActiveNav] = useState<NavTab>('home')
  const [matricula, setMatricula] = useState('')
  const [senha, setSenha] = useState('')
  const [loginError, setLoginError] = useState('')
  const [signupSuccess, setSignupSuccess] = useState(false)
  const [timeline, setTimeline] = useState<TimelineEntry[]>(INITIAL_TIMELINE)
  const [ccoConfirmed, setCcoConfirmed] = useState(false)
  const [historyFilter, setHistoryFilter] = useState<'hoje' | 'semana' | 'mes'>('hoje')
  const [listeningProgress, setListeningProgress] = useState(0)
  const [listeningTimer, setListeningTimer] = useState<ReturnType<typeof setInterval> | null>(null)
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set([1, 2, 8, 9, 13]))
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState(CHAT_MESSAGES)
  const [manualOpen, setManualOpen] = useState<number | null>(null)

  function handleLogin() {
    setLoginError('')
    startAuthTransition(async () => {
      const result = await loginAction({ matricula, senha })
      if (!result.success) {
        setLoginError(result.message)
        return
      }
      setUser(result.user)
      setSenha('')
      setScreen('home')
      setActiveNav('home')
    })
  }

  function handleLogout() {
    startAuthTransition(async () => {
      await logoutAction()
      setUser(null)
      setMatricula('')
      setSenha('')
      setScreen('login')
      setActiveNav('home')
    })
  }

  function handleNav(tab: NavTab) {
    setActiveNav(tab)
    setScreen(tab === 'cp' ? 'cp' : tab)
  }

  function startListening() {
    setListeningProgress(0)
    setScreen('cp-listening')
    const t = setInterval(() => {
      setListeningProgress((p) => {
        if (p >= 100) {
          clearInterval(t)
          setScreen('cp-transcription')
          return 100
        }
        return p + 2
      })
    }, 60)
    setListeningTimer(t)
  }

  function handleSave() {
    const newEntry: TimelineEntry = {
      id: Date.now(),
      time: '09:18',
      type: 'Ar-condicionado',
      description:
        'Unidade de climatização com funcionamento intermitente. Reinicialização realizada.',
      status: 'warning',
      vagao: 'Vagão 2',
    }
    setTimeline((prev) => [...prev, newEntry])
    setScreen('saved')
    setTimeout(() => {
      setScreen('diary')
      setActiveNav('diary')
    }, 2200)
  }

  function toggleCheck(id: number) {
    setCheckedItems((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function sendChat() {
    if (!chatInput.trim()) return
    setChatMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: 'JP Silva', text: chatInput.trim(), time: '09:18', mine: true },
    ])
    setChatInput('')
  }

  const isLoggedIn = user !== null && screen !== 'login' && screen !== 'signup'
  const isPilot = screen === 'pilot'

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: '#d4d4d4' }}
    >
      <div
        className="relative rounded-[2rem] overflow-hidden flex flex-col"
        style={{
          width: 800,
          minHeight: 600,
          maxHeight: '95vh',
          background: C.bg,
          boxShadow: `0 0 0 1px #c8c8c8, 0 0 0 4px #b8b8b8, 0 32px 80px rgba(0,0,0,0.25)`,
        }}
      >
        {/* Status bar */}
        {isLoggedIn && !isPilot && (
          <div
            className="flex items-center justify-between px-6 py-2.5"
            style={{ background: C.primary }}
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs tracking-widest uppercase font-bold text-white opacity-80">
                CPTM
              </span>
              <span className="w-px h-3 bg-white opacity-30" />
              <span className="font-mono text-xs font-bold text-white">TREM 3024</span>
              <span className="w-px h-3 bg-white opacity-30" />
              <span className="font-mono text-xs font-semibold" style={{ color: '#ffd0a0' }}>
                LINHA 11-CORAL
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-white" />
                <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-white">
                  EM OPERAÇÃO
                </span>
              </div>
              <span className="font-mono text-xs text-white opacity-80">09:18</span>
            </div>
          </div>
        )}

        {/* Screen */}
        <div className="flex-1 overflow-y-auto">
          {screen === 'login' && (
            <LoginScreen
              matricula={matricula}
              setMatricula={setMatricula}
              senha={senha}
              setSenha={setSenha}
              onLogin={handleLogin}
              onSignup={() => {
                setLoginError('')
                setSignupSuccess(false)
                setScreen('signup')
              }}
              error={loginError}
              success={signupSuccess}
              pending={isAuthPending}
            />
          )}
          {screen === 'signup' && (
            <SignupScreen
              onBack={() => setScreen('login')}
              onComplete={(createdMatricula) => {
                setMatricula(createdMatricula)
                setSenha('')
                setSignupSuccess(true)
                setScreen('login')
              }}
              signupAction={signupAction}
            />
          )}
          {screen === 'home' && (
            <HomeScreen
              userName={user?.name ?? 'Maquinista'}
              onPilot={() => setScreen('pilot')}
              onNav={handleNav}
            />
          )}
          {screen === 'pilot' && (
            <PilotScreen
              onExit={() => {
                setScreen('home')
                setActiveNav('home')
              }}
              onCP={startListening}
              onCco={() => {
                /* stays in pilot, show overlay */ setScreen('pilot')
              }}
              ccoConfirmed={ccoConfirmed}
              onConfirmCco={() => setCcoConfirmed(true)}
            />
          )}
          {screen === 'diary' && (
            <DiaryScreen
              timeline={timeline}
              onVoice={() => {
                setScreen('cp')
                setActiveNav('cp')
              }}
              onNew={() => {
                setScreen('cp')
                setActiveNav('cp')
              }}
            />
          )}
          {screen === 'cp' && (
            <CpScreen
              onStart={startListening}
              onBack={() => {
                setScreen('diary')
                setActiveNav('diary')
              }}
            />
          )}
          {screen === 'cp-listening' && <CpListeningScreen progress={listeningProgress} />}
          {screen === 'cp-transcription' && (
            <CpTranscriptionScreen
              onConfirm={() => setScreen('confirmation')}
              onCancel={() => {
                setScreen('diary')
                setActiveNav('diary')
              }}
            />
          )}
          {screen === 'confirmation' && (
            <ConfirmationScreen
              onSave={handleSave}
              onCancel={() => {
                setScreen('diary')
                setActiveNav('diary')
              }}
            />
          )}
          {screen === 'saved' && <SavedScreen />}
          {screen === 'cco' && (
            <CcoScreen confirmed={ccoConfirmed} onConfirm={() => setCcoConfirmed(true)} />
          )}
          {screen === 'history' && (
            <HistoryScreen
              entries={HISTORY_ENTRIES}
              filter={historyFilter}
              setFilter={setHistoryFilter}
            />
          )}
          {screen === 'profile' && (
            <ProfileScreen
              user={user}
              onManual={() => setScreen('manual')}
              onCheckin={() => setScreen('checkin')}
              onChat={() => setScreen('chat')}
              onLogout={handleLogout}
              logoutPending={isAuthPending}
            />
          )}
          {screen === 'manual' && (
            <ManualScreen
              onBack={() => setScreen('profile')}
              open={manualOpen}
              setOpen={setManualOpen}
            />
          )}
          {screen === 'checkin' && (
            <CheckinScreen
              onBack={() => setScreen('profile')}
              checked={checkedItems}
              onToggle={toggleCheck}
            />
          )}
          {screen === 'chat' && (
            <ChatScreen
              onBack={() => setScreen('profile')}
              messages={chatMessages}
              input={chatInput}
              setInput={setChatInput}
              onSend={sendChat}
            />
          )}
        </div>

        {/* Bottom nav */}
        {isLoggedIn &&
          !isPilot &&
          !['cp-listening', 'saved', 'manual', 'checkin', 'chat'].includes(screen) && (
            <BottomNav active={activeNav} onNav={handleNav} hasCcoAlert={!ccoConfirmed} />
          )}
      </div>
    </div>
  )
}

// ── Login ─────────────────────────────────────────────────────────────────────
function LoginScreen({
  matricula,
  setMatricula,
  senha,
  setSenha,
  onLogin,
  onSignup,
  error,
  success,
  pending,
}: {
  matricula: string
  setMatricula: (v: string) => void
  senha: string
  setSenha: (v: string) => void
  onLogin: () => void
  onSignup: () => void
  error: string
  success: boolean
  pending: boolean
}) {
  return (
    <div
      className="min-h-[600px] flex flex-col items-center justify-center px-16 py-12"
      style={{ background: C.bg }}
    >
      <div className="mb-10 flex flex-col items-center gap-3 w-full max-w-sm">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: C.primary }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="9" width="20" height="10" rx="2" stroke="white" strokeWidth="1.5" />
              <rect x="5" y="5" width="14" height="6" rx="1.5" stroke="white" strokeWidth="1.5" />
              <circle cx="6.5" cy="19" r="2" stroke="white" strokeWidth="1.5" />
              <circle cx="17.5" cy="19" r="2" stroke="white" strokeWidth="1.5" />
              <line
                x1="9"
                y1="14"
                x2="15"
                y2="14"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: C.text }}>
              Diário de Bordo
            </h1>
            <p
              className="text-xs font-mono tracking-widest uppercase mt-0.5"
              style={{ color: C.muted }}
            >
              Protótipo acadêmico – CPTM-SP
            </p>
          </div>
        </div>
        <div className="w-full h-px mt-2" style={{ background: C.border }} />
      </div>

      <div className="w-full max-w-sm space-y-4">
        <div>
          <label
            className="block text-xs font-mono uppercase tracking-widest mb-2"
            style={{ color: C.muted }}
          >
            Matrícula
          </label>
          <input
            type="text"
            value={matricula}
            onChange={(e) => setMatricula(e.target.value)}
            placeholder="Ex: 00123456"
            style={{ background: C.card, border: `1px solid ${C.border}`, color: C.text }}
            className="w-full rounded-lg px-4 py-3.5 text-sm font-mono placeholder-[#bbbbbb] focus:outline-none"
            onFocus={(e) => {
              e.target.style.borderColor = C.primary
              e.target.style.boxShadow = `0 0 0 3px ${C.primary}20`
            }}
            onBlur={(e) => {
              e.target.style.borderColor = C.border
              e.target.style.boxShadow = 'none'
            }}
            onKeyDown={(e) => e.key === 'Enter' && onLogin()}
          />
        </div>
        <div>
          <label
            className="block text-xs font-mono uppercase tracking-widest mb-2"
            style={{ color: C.muted }}
          >
            Senha
          </label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="••••••••"
            style={{ background: C.card, border: `1px solid ${C.border}`, color: C.text }}
            className="w-full rounded-lg px-4 py-3.5 text-sm font-mono placeholder-[#bbbbbb] focus:outline-none"
            onFocus={(e) => {
              e.target.style.borderColor = C.primary
              e.target.style.boxShadow = `0 0 0 3px ${C.primary}20`
            }}
            onBlur={(e) => {
              e.target.style.borderColor = C.border
              e.target.style.boxShadow = 'none'
            }}
            onKeyDown={(e) => e.key === 'Enter' && onLogin()}
          />
        </div>
        {success && (
          <div
            className="rounded-lg border px-3 py-2.5 text-xs font-medium"
            style={{ color: '#166534', borderColor: '#86efac', background: '#f0fdf4' }}
          >
            Cadastro concluído. Entre com sua matrícula e senha.
          </div>
        )}
        {error && (
          <p
            role="alert"
            className="text-xs font-mono flex items-center gap-1.5"
            style={{ color: C.danger }}
          >
            {error}
          </p>
        )}
        <button
          disabled={pending}
          onClick={onLogin}
          style={{ background: C.primary }}
          className="w-full text-white font-semibold py-4 rounded-lg text-base mt-2 tracking-wide hover:opacity-90 active:opacity-75 transition-opacity disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? 'Entrando...' : 'Entrar'}
        </button>
        <button
          type="button"
          onClick={onSignup}
          className="w-full py-3 text-sm font-semibold transition-opacity hover:opacity-70"
          style={{ color: C.primary }}
        >
          Ainda não tem acesso? Cadastre-se
        </button>
      </div>
      <p
        className="mt-12 text-[10px] font-mono tracking-widest uppercase text-center"
        style={{ color: '#aaaaaa' }}
      >
        Sistema de apoio à operação ferroviária
      </p>
    </div>
  )
}

// ── Signup ────────────────────────────────────────────────────────────────────
function SignupScreen({
  onBack,
  onComplete,
  signupAction,
}: {
  onBack: () => void
  onComplete: (matricula: string) => void
  signupAction: typeof import('@/app/(frontend)/actions').signupAction
}) {
  const [nome, setNome] = useState('')
  const [matricula, setMatricula] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  function submit() {
    setError('')
    startTransition(async () => {
      const result = await signupAction({
        confirmarSenha,
        email,
        matricula,
        nome,
        senha,
      })

      if (!result.success) {
        setError(result.message)
        return
      }

      onComplete(result.matricula)
    })
  }

  const fields = [
    {
      label: 'Nome completo',
      value: nome,
      setValue: setNome,
      type: 'text',
      placeholder: 'Ex: João Paulo Silva',
      autoComplete: 'name',
    },
    {
      label: 'Matrícula',
      value: matricula,
      setValue: setMatricula,
      type: 'text',
      placeholder: 'Ex: 00123456',
      autoComplete: 'username',
    },
    {
      label: 'E-mail',
      value: email,
      setValue: setEmail,
      type: 'email',
      placeholder: 'nome@exemplo.com',
      autoComplete: 'email',
    },
    {
      label: 'Senha',
      value: senha,
      setValue: setSenha,
      type: 'password',
      placeholder: 'Mínimo de 8 caracteres',
      autoComplete: 'new-password',
    },
    {
      label: 'Confirmar senha',
      value: confirmarSenha,
      setValue: setConfirmarSenha,
      type: 'password',
      placeholder: 'Repita sua senha',
      autoComplete: 'new-password',
    },
  ]

  return (
    <div className="min-h-[600px] px-8 py-7 sm:px-16" style={{ background: C.bg }}>
      <div className="mx-auto w-full max-w-md">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70"
          style={{ color: C.mutedFg }}
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Voltar ao login
        </button>

        <div className="mb-6 flex items-center gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            style={{ background: C.primary }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 13a4 4 0 100-8 4 4 0 000 8zM5 21a7 7 0 0114 0"
                stroke="white"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
              <path d="M19 5v4M17 7h4" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-mono uppercase tracking-widest" style={{ color: C.primary }}>
              Novo acesso
            </p>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: C.text }}>
              Criar sua conta
            </h1>
          </div>
        </div>

        <p className="mb-5 text-sm leading-relaxed" style={{ color: C.mutedFg }}>
          Cadastre seus dados operacionais. Após concluir, você voltará ao login para entrar com a
          nova conta.
        </p>

        <div className="space-y-3.5">
          {fields.map((field) => (
            <label key={field.label} className="block">
              <span
                className="mb-1.5 block text-[11px] font-mono uppercase tracking-widest"
                style={{ color: C.muted }}
              >
                {field.label}
              </span>
              <input
                autoComplete={field.autoComplete}
                type={field.type}
                value={field.value}
                onChange={(event) => field.setValue(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && submit()}
                placeholder={field.placeholder}
                className="w-full rounded-lg border bg-white px-4 py-3 text-sm outline-none transition-shadow placeholder:text-[#bbbbbb] focus:ring-3"
                style={
                  {
                    borderColor: C.border,
                    color: C.text,
                    '--tw-ring-color': `${C.primary}20`,
                  } as React.CSSProperties
                }
              />
            </label>
          ))}

          {error && (
            <p
              role="alert"
              className="rounded-lg border px-3 py-2.5 text-xs font-medium"
              style={{ background: C.dangerBg, borderColor: '#fca5a5', color: '#991b1b' }}
            >
              {error}
            </p>
          )}

          <button
            type="button"
            disabled={pending}
            onClick={submit}
            className="w-full rounded-lg py-4 text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
            style={{ background: C.primary }}
          >
            {pending ? 'Criando conta...' : 'Finalizar cadastro'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Home ──────────────────────────────────────────────────────────────────────
function HomeScreen({
  userName,
  onPilot,
  onNav,
}: {
  userName: string
  onPilot: () => void
  onNav: (t: NavTab) => void
}) {
  return (
    <div className="p-6 space-y-5" style={{ background: C.bg }}>
      {/* Welcome */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-mono uppercase tracking-widest" style={{ color: C.muted }}>
            Bom dia
          </p>
          <h2 className="text-2xl font-bold tracking-tight mt-0.5" style={{ color: C.text }}>
            {userName}
          </h2>
          <p className="text-sm mt-1" style={{ color: C.muted }}>
            Turno A — 07:00 às 15:00
          </p>
        </div>
        <div className="text-right">
          <div className="font-mono text-2xl font-bold" style={{ color: C.text }}>
            09:18
          </div>
          <div className="text-xs font-mono" style={{ color: C.muted }}>
            11 SET 2026
          </div>
        </div>
      </div>

      {/* Status card */}
      <div className="rounded-xl overflow-hidden" style={{ background: C.primary }}>
        <div className="px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="9" width="20" height="10" rx="2" stroke="white" strokeWidth="1.5" />
                <rect x="5" y="5" width="14" height="6" rx="1.5" stroke="white" strokeWidth="1.5" />
                <circle cx="6.5" cy="19" r="2" stroke="white" strokeWidth="1.5" />
                <circle cx="17.5" cy="19" r="2" stroke="white" strokeWidth="1.5" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-white text-base">Trem 3024</p>
              <p className="text-white/70 text-xs font-mono">Linha 11-Coral</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full animate-pulse bg-white" />
            <span className="text-white font-semibold text-sm uppercase tracking-wide">
              Em operação
            </span>
          </div>
        </div>
      </div>

      {/* CP */}
      <button
        onClick={() => onNav('cp')}
        className="w-full flex items-center gap-4 px-5 py-4 rounded-xl text-white font-bold transition-all hover:opacity-90 active:scale-[0.99]"
        style={{ background: C.primary, boxShadow: `0 4px 20px ${C.primary}40` }}
      >
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <svg
            width="20"
            height="20"
            fill="none"
            stroke="white"
            strokeWidth="1.8"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        </div>
        <div className="text-left">
          <p className="font-bold text-white">CP — Assistente de Voz</p>
          <p className="text-white/60 text-xs font-normal">Registrar ocorrência por voz</p>
        </div>
        <svg
          width="16"
          height="16"
          fill="none"
          stroke="white"
          strokeWidth="2"
          viewBox="0 0 24 24"
          className="ml-auto opacity-50"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
        </svg>
      </button>

      {/* Modo Piloto */}
      <button
        onClick={onPilot}
        className="w-full flex items-center justify-between px-5 py-4 rounded-xl text-white font-bold text-base transition-all hover:opacity-90 active:scale-[0.99]"
        style={{ background: '#111111', boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="white"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="3" />
              <path
                strokeLinecap="round"
                d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"
              />
            </svg>
          </div>
          <div className="text-left">
            <p className="font-bold text-white">Modo Piloto</p>
            <p className="text-white/50 text-xs font-normal">Interface focada para condução</p>
          </div>
        </div>
        <svg
          width="16"
          height="16"
          fill="none"
          stroke="white"
          strokeWidth="2"
          viewBox="0 0 24 24"
          className="opacity-50"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  )
}

function QuickCard({
  icon,
  label,
  sub,
  onClick,
  accent = false,
}: {
  icon: React.ReactNode
  label: string
  sub: string
  onClick: () => void
  accent?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 p-4 rounded-xl text-left transition-all hover:opacity-90 active:scale-[0.98]"
      style={{
        background: accent ? C.primary : C.card,
        border: accent ? 'none' : `1px solid ${C.border}`,
      }}
    >
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${accent ? 'bg-white/20' : ''}`}
        style={!accent ? { background: C.dangerBg } : {}}
      >
        <div style={{ color: accent ? 'white' : C.primary }}>{icon}</div>
      </div>
      <div>
        <p className="font-semibold text-sm" style={{ color: accent ? 'white' : C.text }}>
          {label}
        </p>
        <p
          className="text-xs mt-0.5"
          style={{ color: accent ? 'rgba(255,255,255,0.65)' : C.muted }}
        >
          {sub}
        </p>
      </div>
    </button>
  )
}

// ── Pilot Mode ────────────────────────────────────────────────────────────────
function PilotScreen({
  onExit,
  onCP,
  onCco,
  ccoConfirmed,
  onConfirmCco,
}: {
  onExit: () => void
  onCP: () => void
  onCco: () => void
  ccoConfirmed: boolean
  onConfirmCco: () => void
}) {
  const [showCco, setShowCco] = useState(false)

  return (
    <div className="min-h-[540px] flex flex-col" style={{ background: '#0d0d0d' }}>
      {/* Pilot status bar */}
      <div
        className="flex items-center justify-between px-6 py-3"
        style={{ background: '#1a1a1a', borderBottom: '1px solid #333' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: C.primary }} />
          <span
            className="font-mono text-xs font-bold uppercase tracking-widest"
            style={{ color: C.primary }}
          >
            MODO PILOTO ATIVO
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-white/50">TREM 3024 · L11-CORAL</span>
          <span className="font-mono text-sm font-bold text-white">09:18</span>
        </div>
      </div>

      {/* Main content */}
      {!showCco ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
          <div className="text-center mb-4">
            <p className="font-mono text-xs text-white/30 uppercase tracking-widest mb-1">
              Interface focada
            </p>
            <h2 className="text-3xl font-bold text-white tracking-tight">Diário de Bordo</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
            {/* CP button */}
            <button
              onClick={onCP}
              className="flex flex-col items-center justify-center gap-3 rounded-2xl py-8 text-white font-bold text-lg transition-all active:scale-95 hover:opacity-90"
              style={{ background: C.primary, boxShadow: `0 4px 24px ${C.primary}60` }}
            >
              <svg
                width="36"
                height="36"
                fill="none"
                stroke="white"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
              CP
              <span className="text-xs font-normal text-white/60">Assistente de voz</span>
            </button>

            {/* CCO button */}
            <button
              onClick={() => setShowCco(true)}
              className="flex flex-col items-center justify-center gap-3 rounded-2xl py-8 font-bold text-lg transition-all active:scale-95 hover:opacity-90 relative"
              style={{
                background: '#1e1e1e',
                border: `2px solid ${!ccoConfirmed ? C.primary : '#333'}`,
              }}
            >
              {!ccoConfirmed && (
                <div
                  className="absolute top-3 right-3 w-3 h-3 rounded-full animate-pulse"
                  style={{ background: C.primary }}
                />
              )}
              <svg
                width="36"
                height="36"
                fill="none"
                stroke={!ccoConfirmed ? C.primary : '#666'}
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                />
              </svg>
              <span style={{ color: !ccoConfirmed ? C.primary : '#666' }}>CCO</span>
              <span
                className="text-xs font-normal"
                style={{ color: !ccoConfirmed ? C.primary + 'aa' : '#444' }}
              >
                {!ccoConfirmed ? '1 mensagem' : 'Sem alertas'}
              </span>
            </button>
          </div>

          {/* Exit button */}
          <button
            onClick={onExit}
            className="mt-4 flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-80"
            style={{ background: '#1e1e1e', border: '1px solid #333', color: '#888' }}
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retornar ao modo normal
          </button>
        </div>
      ) : (
        /* CCO overlay inside pilot */
        <div className="flex-1 flex flex-col p-6 gap-4">
          <button
            onClick={() => setShowCco(false)}
            className="flex items-center gap-2 text-sm self-start"
            style={{ color: '#666' }}
          >
            <svg
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </button>
          <div
            className="rounded-xl overflow-hidden"
            style={{ borderLeft: `4px solid ${ccoConfirmed ? '#16a34a' : C.primary}` }}
          >
            <div
              className="px-5 py-3 flex items-center justify-between"
              style={{ background: ccoConfirmed ? '#052e1699' : '#3d000099' }}
            >
              <span
                className="font-mono text-[10px] font-semibold uppercase tracking-widest"
                style={{ color: ccoConfirmed ? '#16a34a' : C.primary }}
              >
                {ccoConfirmed ? 'RECEBIDA' : 'PRIORIDADE ALTA'}
              </span>
              <span className="font-mono text-xs text-white/40">09:03</span>
            </div>
            <div className="px-5 py-4" style={{ background: '#1e1e1e' }}>
              <p className="text-white text-base leading-relaxed mb-4">
                Alteração operacional identificada. Aguardar orientação antes de prosseguir com a
                marcha.
              </p>
              {ccoConfirmed ? (
                <div
                  className="flex items-center gap-2 text-sm font-semibold pt-3"
                  style={{ borderTop: '1px solid #333', color: '#16a34a' }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Recebido pelo operador às 09:18
                </div>
              ) : (
                <button
                  onClick={onConfirmCco}
                  className="w-full text-white font-semibold py-3.5 rounded-lg text-sm flex items-center justify-center gap-2 hover:opacity-90"
                  style={{ background: C.primary }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Confirmar recebimento
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Diary ─────────────────────────────────────────────────────────────────────
function DiaryScreen({
  timeline,
  onVoice,
  onNew,
}: {
  timeline: TimelineEntry[]
  onVoice: () => void
  onNew: () => void
}) {
  return (
    <div className="p-6 space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight" style={{ color: C.text }}>
            Diário de Bordo
          </h2>
          <p className="text-sm mt-0.5" style={{ color: C.muted }}>
            Registros do trem 3024
          </p>
        </div>
        <div className="text-right">
          <div className="font-mono text-2xl font-bold" style={{ color: C.text }}>
            09:18
          </div>
          <div className="text-xs font-mono" style={{ color: C.muted }}>
            11 SET 2026
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onNew}
          className="flex items-center justify-center gap-2.5 rounded-xl py-4 px-5 font-semibold text-sm transition-all hover:opacity-90"
          style={{ background: C.card, border: `1px solid ${C.border}`, color: C.textSoft }}
        >
          <svg
            className="w-5 h-5"
            style={{ color: C.primary }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nova ocorrência
        </button>
        <button
          onClick={onVoice}
          className="flex items-center justify-center gap-2.5 rounded-xl py-4 px-5 text-white font-semibold text-sm transition-all hover:opacity-90"
          style={{ background: C.primary, boxShadow: `0 4px 20px ${C.primary}40` }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
          Registrar via CP
        </button>
      </div>

      <div>
        <h3 className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: C.muted }}>
          Ocorrências do turno
        </h3>
        <TimelineList entries={timeline} />
      </div>
    </div>
  )
}

function TimelineList({ entries }: { entries: TimelineEntry[] }) {
  return (
    <div className="space-y-0">
      {entries.map((entry, i) => (
        <div key={entry.id} className="flex gap-4">
          <div className="flex flex-col items-center" style={{ width: 16 }}>
            <div
              className="w-3 h-3 rounded-full mt-1.5 shrink-0"
              style={{
                background:
                  entry.status === 'warning'
                    ? C.warning
                    : entry.status === 'urgent'
                      ? C.danger
                      : entry.status === 'cco'
                        ? C.ccoBlue
                        : C.primary,
              }}
            />
            {i < entries.length - 1 && (
              <div className="w-px flex-1 mt-1" style={{ background: C.border }} />
            )}
          </div>
          <div className={`pb-5 flex-1 ${i === entries.length - 1 ? 'pb-2' : ''}`}>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-mono text-sm font-bold" style={{ color: C.primary }}>
                {entry.time}
              </span>
              <StatusBadge status={entry.status} />
              {entry.vagao && (
                <span
                  className="font-mono text-[10px] px-2 py-0.5 rounded uppercase tracking-wider font-semibold"
                  style={{ background: '#f0f0f0', color: C.muted, border: `1px solid ${C.border}` }}
                >
                  {entry.vagao}
                </span>
              )}
              <span className="text-sm font-semibold" style={{ color: C.text }}>
                {entry.type}
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: C.mutedFg }}>
              {entry.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── CP (Assistente de voz) ────────────────────────────────────────────────────
function CpScreen({ onStart, onBack }: { onStart: () => void; onBack: () => void }) {
  return (
    <div className="p-6 flex flex-col items-center min-h-[520px]">
      <div className="w-full flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm hover:opacity-70"
          style={{ color: C.muted }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Voltar
        </button>
        <h2 className="text-base font-semibold" style={{ color: C.text }}>
          CP
        </h2>
        <div className="w-16" />
      </div>

      {/* CP welcome card */}
      <div
        className="w-full max-w-sm rounded-2xl p-5 mb-6"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ background: C.dangerBg }}
          >
            <span className="font-mono text-sm font-bold" style={{ color: C.primary }}>
              CP
            </span>
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: C.text }}>
              Assistente CP
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: C.success }} />
              <p className="text-xs font-mono" style={{ color: C.success }}>
                Online
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl p-3.5" style={{ background: C.bg }}>
          <p className="text-sm leading-relaxed" style={{ color: C.textSoft }}>
            Olá, <strong>João Paulo</strong>! Estou pronto para registrar ocorrências do trem 3024.
            Pressione o microfone e descreva o problema — eu estruturo o registro automaticamente.
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full max-w-sm">
        <button
          onClick={onStart}
          className="relative w-32 h-32 rounded-full flex items-center justify-center text-white transition-all active:scale-95 hover:opacity-90"
          style={{ background: C.primary, boxShadow: `0 4px 24px ${C.primary}40` }}
        >
          <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        </button>

        <p className="text-xs font-mono uppercase tracking-widest" style={{ color: C.muted }}>
          Toque para iniciar gravação
        </p>

        <div
          className="w-full rounded-xl p-4 space-y-2"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          <p className="text-xs font-mono uppercase tracking-widest" style={{ color: C.muted }}>
            Exemplos de registros
          </p>
          <ul className="space-y-1.5">
            {[
              '"Porta do vagão 3 travada"',
              '"Ar-condicionado vagão 5 desligado"',
              '"Janela quebrada no vagão 2"',
            ].map((tip) => (
              <li key={tip} className="flex items-start gap-2 text-xs" style={{ color: C.mutedFg }}>
                <span style={{ color: C.primary }} className="mt-0.5">
                  ›
                </span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function CpListeningScreen({ progress }: { progress: number }) {
  return (
    <div
      className="min-h-[520px] flex flex-col items-center justify-center gap-8 p-8"
      style={{ background: C.bg }}
    >
      <div className="relative flex items-center justify-center">
        <PulseRing />
        <div
          className="relative w-32 h-32 rounded-full flex items-center justify-center text-white z-10"
          style={{ background: C.primary, boxShadow: `0 8px 32px ${C.primary}50` }}
        >
          <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        </div>
      </div>
      <div className="flex flex-col items-center gap-3">
        <WaveAnimation />
        <p className="text-lg font-semibold tracking-wide" style={{ color: C.text }}>
          CP está ouvindo...
        </p>
        <p className="text-xs font-mono uppercase tracking-widest" style={{ color: C.muted }}>
          Fale a ocorrência do trem
        </p>
      </div>
      <div className="w-64 rounded-full h-1.5 overflow-hidden" style={{ background: C.border }}>
        <div
          className="h-full rounded-full transition-all duration-100"
          style={{ width: `${progress}%`, background: C.primary }}
        />
      </div>
      <p className="text-xs font-mono" style={{ color: C.muted }}>
        Processando automaticamente ao concluir
      </p>
    </div>
  )
}

function CpTranscriptionScreen({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void
  onCancel: () => void
}) {
  const [text, setText] = useState(
    'Ar-condicionado do vagão 2 apresentando funcionamento intermitente desde a estação Patriarca.',
  )
  const [editing, setEditing] = useState(false)

  return (
    <div className="p-6 flex flex-col min-h-[520px]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-semibold" style={{ color: C.text }}>
          CP — Transcrição
        </h2>
        <div className="flex items-center gap-1.5 text-xs font-mono" style={{ color: C.success }}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Transcrição concluída
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-5">
        <div
          className="rounded-xl p-5"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-mono uppercase tracking-widest" style={{ color: C.muted }}>
              Transcrição
            </p>
            <button
              onClick={() => setEditing(!editing)}
              className="text-xs font-mono hover:opacity-70"
              style={{ color: C.primary }}
            >
              {editing ? 'Concluir' : 'Editar'}
            </button>
          </div>
          {editing ? (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              className="w-full rounded-lg p-3 text-sm leading-relaxed resize-none focus:outline-none"
              style={{
                background: C.bg,
                border: `1px solid ${C.primary}`,
                color: C.text,
                boxShadow: `0 0 0 3px ${C.primary}15`,
              }}
            />
          ) : (
            <p className="text-base leading-relaxed" style={{ color: C.text }}>
              "{text}"
            </p>
          )}
        </div>

        <div
          className="rounded-xl p-4"
          style={{ background: C.bg, border: `1px solid ${C.border}` }}
        >
          <p
            className="text-xs font-mono uppercase tracking-widest mb-3"
            style={{ color: C.muted }}
          >
            Estrutura identificada pelo CP
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Tipo', value: 'Ar-condicionado' },
              { label: 'Trem', value: '3024 – Linha 11' },
              { label: 'Vagão', value: 'Vagão 2' },
              { label: 'Local', value: 'Est. Patriarca' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p
                  className="text-[10px] font-mono uppercase tracking-wider"
                  style={{ color: C.muted }}
                >
                  {label}
                </p>
                <p className="text-sm font-medium mt-0.5" style={{ color: C.text }}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-auto">
          <button
            onClick={onCancel}
            className="font-semibold py-3.5 rounded-xl text-sm hover:opacity-80"
            style={{ background: C.card, border: `1px solid ${C.border}`, color: C.mutedFg }}
          >
            Cancelar
          </button>
          <button
            onClick={() => setEditing(!editing)}
            className="font-semibold py-3.5 rounded-xl text-sm hover:opacity-80"
            style={{ background: C.card, border: `1px solid ${C.primary}`, color: C.primary }}
          >
            Editar
          </button>
          <button
            onClick={onConfirm}
            className="text-white font-semibold py-3.5 rounded-xl text-sm hover:opacity-90"
            style={{ background: C.primary }}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Confirmation & Saved ──────────────────────────────────────────────────────
function ConfirmationScreen({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) {
  return (
    <div className="p-6 flex flex-col min-h-[520px]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-semibold" style={{ color: C.text }}>
          Confirmar registro
        </h2>
        <span className="font-mono text-xs" style={{ color: C.muted }}>
          09:18
        </span>
      </div>
      <div className="flex-1 space-y-4">
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          {[
            { label: 'Tipo', value: 'Ar-condicionado', accent: true },
            { label: 'Vagão', value: 'Vagão 2' },
            { label: 'Trem', value: '3024 – Linha 11-Coral' },
            { label: 'Horário', value: '09:18 — 11 Set 2026' },
            {
              label: 'Descrição',
              value:
                'Ar-condicionado do vagão 2 com funcionamento intermitente desde a estação Patriarca.',
            },
          ].map(({ label, value, accent }, i, arr) => (
            <div
              key={label}
              className="flex gap-4 px-5 py-4"
              style={{ borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : 'none' }}
            >
              <div className="w-28 shrink-0">
                <p
                  className="text-[10px] font-mono uppercase tracking-wider"
                  style={{ color: C.muted }}
                >
                  {label}
                </p>
              </div>
              <p
                className="text-sm font-medium flex-1"
                style={{ color: accent ? C.warning : C.text }}
              >
                {value}
              </p>
            </div>
          ))}
        </div>
        <div
          className="rounded-xl p-4 flex items-start gap-3"
          style={{ background: C.bg, border: `1px solid ${C.border}` }}
        >
          <svg
            className="w-4 h-4 shrink-0 mt-0.5"
            style={{ color: C.primary }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-xs leading-relaxed" style={{ color: C.muted }}>
            O registro será incluído no diário e disponibilizado ao CCO em tempo real. Não é
            possível excluir após salvar.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={onCancel}
            className="font-semibold py-4 rounded-xl text-sm hover:opacity-80"
            style={{ background: C.card, border: `1px solid ${C.border}`, color: C.mutedFg }}
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            className="text-white font-semibold py-4 rounded-xl text-sm hover:opacity-90 flex items-center justify-center gap-2"
            style={{ background: C.primary }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
              />
            </svg>
            Salvar no Diário
          </button>
        </div>
      </div>
    </div>
  )
}

function SavedScreen() {
  return (
    <div className="min-h-[520px] flex flex-col items-center justify-center gap-5 p-8">
      <div
        className="w-20 h-20 rounded-full border-2 flex items-center justify-center"
        style={{ background: C.successBg, borderColor: C.success }}
      >
        <svg
          className="w-10 h-10"
          style={{ color: C.success }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-xl font-bold" style={{ color: C.text }}>
          Ocorrência registrada
        </p>
        <p className="text-sm mt-1" style={{ color: C.muted }}>
          Adicionada ao diário às 09:18
        </p>
      </div>
      <div className="flex items-center gap-2 text-xs font-mono" style={{ color: C.success }}>
        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.success }} />
        CCO notificado automaticamente
      </div>
    </div>
  )
}

// ── CCO ───────────────────────────────────────────────────────────────────────
function CcoScreen({ confirmed, onConfirm }: { confirmed: boolean; onConfirm: () => void }) {
  return (
    <div className="p-6 flex flex-col min-h-[520px]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-semibold" style={{ color: C.text }}>
          Comunicações do CCO
        </h2>
        <div className="flex items-center gap-1.5">
          <div
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: C.ccoBlue }}
          />
          <span className="text-xs font-mono uppercase tracking-wider" style={{ color: C.ccoBlue }}>
            Ao vivo
          </span>
        </div>
      </div>
      <div className="space-y-4">
        <div
          className="rounded-xl overflow-hidden"
          style={{ borderLeft: `4px solid ${confirmed ? C.success : C.danger}` }}
        >
          <div
            className="px-5 py-3 flex items-center justify-between"
            style={{ background: confirmed ? '#dcfce7' : '#fee2e2' }}
          >
            <span
              className="font-mono text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: confirmed ? C.success : C.danger }}
            >
              {confirmed ? 'RECEBIDA' : 'PRIORIDADE ALTA'}
            </span>
            <span className="font-mono text-xs" style={{ color: C.muted }}>
              09:03
            </span>
          </div>
          <div className="px-5 py-4" style={{ background: C.card }}>
            <div className="flex items-start gap-3 mb-4">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ background: '#dbeafe', border: '1px solid #93c5fd' }}
              >
                <span className="font-mono text-xs font-bold" style={{ color: '#1e40af' }}>
                  CCO
                </span>
              </div>
              <div>
                <p className="text-xs font-mono mb-1" style={{ color: C.muted }}>
                  Centro de Controle Operacional
                </p>
                <p className="text-base leading-relaxed" style={{ color: C.text }}>
                  Alteração operacional identificada. Aguardar orientação antes de prosseguir com a
                  marcha.
                </p>
              </div>
            </div>
            {confirmed ? (
              <div
                className="flex items-center gap-2 text-sm font-semibold py-3"
                style={{ borderTop: `1px solid ${C.border}`, color: C.success }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Recebido pelo operador às 09:18
              </div>
            ) : (
              <button
                onClick={onConfirm}
                className="w-full text-white font-semibold py-3.5 rounded-lg text-sm flex items-center justify-center gap-2 hover:opacity-90"
                style={{ background: C.danger }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Confirmar recebimento
              </button>
            )}
          </div>
        </div>

        <div
          className="rounded-xl overflow-hidden opacity-60"
          style={{ border: `1px solid ${C.border}` }}
        >
          <div className="px-5 py-3 flex items-center justify-between" style={{ background: C.bg }}>
            <span
              className="font-mono text-[10px] uppercase tracking-widest"
              style={{ color: C.muted }}
            >
              Informativo
            </span>
            <span className="font-mono text-xs" style={{ color: C.muted }}>
              08:15
            </span>
          </div>
          <div className="px-5 py-4" style={{ background: C.card }}>
            <div className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ background: '#dbeafe', border: '1px solid #93c5fd' }}
              >
                <span className="font-mono text-xs font-bold" style={{ color: '#1e40af' }}>
                  CCO
                </span>
              </div>
              <div>
                <p className="text-xs font-mono mb-1" style={{ color: C.muted }}>
                  Centro de Controle Operacional
                </p>
                <p className="text-sm leading-relaxed" style={{ color: C.mutedFg }}>
                  Operação normalizada no trecho Luz–Brás. Intervalo de 8 minutos mantido.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── History ───────────────────────────────────────────────────────────────────
function HistoryScreen({
  entries,
  filter,
  setFilter,
}: {
  entries: TimelineEntry[]
  filter: 'hoje' | 'semana' | 'mes'
  setFilter: (f: 'hoje' | 'semana' | 'mes') => void
}) {
  return (
    <div className="p-6 flex flex-col min-h-[520px]">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold" style={{ color: C.text }}>
          Histórico — Trem 3024
        </h2>
        <div
          className="flex gap-1 rounded-lg p-1"
          style={{ background: C.bg, border: `1px solid ${C.border}` }}
        >
          {(['hoje', 'semana', 'mes'] as const).map((k) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className="px-3 py-1.5 rounded-md text-xs font-semibold transition-all capitalize"
              style={filter === k ? { background: C.primary, color: 'white' } : { color: C.muted }}
            >
              {k === 'mes' ? 'Mês' : k.charAt(0).toUpperCase() + k.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-mono uppercase tracking-widest" style={{ color: C.muted }}>
          11 Set 2026 — Turno A
        </p>
        <span className="text-xs font-mono" style={{ color: C.primary }}>
          {entries.length} registros
        </span>
      </div>
      <TimelineList entries={entries} />
    </div>
  )
}

// ── Profile ───────────────────────────────────────────────────────────────────
function ProfileScreen({
  user,
  onManual,
  onCheckin,
  onChat,
  onLogout,
  logoutPending,
}: {
  user: AppUser | null
  onManual: () => void
  onCheckin: () => void
  onChat: () => void
  onLogout: () => void
  logoutPending: boolean
}) {
  const initials = (user?.name ?? 'Maquinista')
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  return (
    <div className="p-6 flex flex-col min-h-[520px]">
      <h2 className="text-base font-semibold mb-5" style={{ color: C.text }}>
        Perfil do Operador
      </h2>

      <div className="flex items-center gap-4 mb-5">
        <div
          className="w-16 h-16 rounded-full border-2 flex items-center justify-center"
          style={{ background: '#fee2e2', borderColor: C.primary }}
        >
          <span className="text-2xl font-bold" style={{ color: C.primary }}>
            {initials}
          </span>
        </div>
        <div>
          <p className="text-base font-bold" style={{ color: C.text }}>
            {user?.name ?? 'Maquinista'}
          </p>
          <p className="font-mono text-xs" style={{ color: C.muted }}>
            MAT. {user?.matricula ?? '—'}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: C.success }} />
            <span className="text-xs" style={{ color: C.success }}>
              Serviço ativo
            </span>
          </div>
        </div>
      </div>

      {/* Ferramentas operacionais */}
      <div className="mb-4">
        <p className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: C.muted }}>
          Ferramentas operacionais
        </p>
        <div className="grid grid-cols-3 gap-3">
          <ProfileActionBtn
            icon={<ManualIcon />}
            label="Manual"
            sub="Guia de problemas"
            onClick={onManual}
          />
          <ProfileActionBtn
            icon={<CheckIcon />}
            label="Check-in"
            sub="Inspeção noturna"
            onClick={onCheckin}
          />
          <ProfileActionBtn
            icon={<ChatIcon />}
            label="Chat"
            sub="Emergência"
            onClick={onChat}
            emergency
          />
        </div>
      </div>

      <div
        className="rounded-xl overflow-hidden mb-4"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
      >
        {[
          { label: 'Função', value: 'Maquinista' },
          { label: 'Linha', value: '11-Coral' },
          { label: 'Trem', value: '3024' },
          { label: 'Turno', value: 'A — 07:00 às 15:00' },
        ].map(({ label, value }, i, arr) => (
          <div
            key={label}
            className="flex items-center justify-between px-5 py-3.5"
            style={{ borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : 'none' }}
          >
            <span className="text-xs font-mono uppercase tracking-wider" style={{ color: C.muted }}>
              {label}
            </span>
            <span className="text-sm font-medium" style={{ color: C.text }}>
              {value}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Hoje', value: '4' },
          { label: 'Semana', value: '23' },
          { label: 'Mês', value: '18' },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-xl p-4 text-center"
            style={{ background: C.bg, border: `1px solid ${C.border}` }}
          >
            <p className="font-mono text-2xl font-bold" style={{ color: C.primary }}>
              {value}
            </p>
            <p
              className="text-[10px] mt-1 uppercase tracking-wider font-mono"
              style={{ color: C.muted }}
            >
              {label}
            </p>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onLogout}
        disabled={logoutPending}
        className="w-full font-semibold py-3.5 rounded-xl text-sm hover:opacity-80 flex items-center justify-center gap-2 disabled:cursor-wait disabled:opacity-60"
        style={{ background: C.card, border: `1px solid ${C.border}`, color: C.mutedFg }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
        {logoutPending ? 'Encerrando...' : 'Encerrar turno e sair'}
      </button>
    </div>
  )
}

function ProfileActionBtn({
  icon,
  label,
  sub,
  onClick,
  emergency = false,
}: {
  icon: React.ReactNode
  label: string
  sub: string
  onClick: () => void
  emergency?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:opacity-90 active:scale-[0.97]"
      style={{
        background: emergency ? C.primary : C.dangerBg,
        border: emergency ? 'none' : `1px solid ${C.border}`,
      }}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{ background: emergency ? 'rgba(255,255,255,0.2)' : '#fff' }}
      >
        <div style={{ color: emergency ? 'white' : C.primary }}>{icon}</div>
      </div>
      <div className="text-center">
        <p className="font-bold text-sm" style={{ color: emergency ? 'white' : C.primary }}>
          {label}
        </p>
        <p
          className="text-[10px] mt-0.5 leading-tight"
          style={{ color: emergency ? 'rgba(255,255,255,0.65)' : C.muted }}
        >
          {sub}
        </p>
      </div>
    </button>
  )
}

// ── Manual ────────────────────────────────────────────────────────────────────
function ManualScreen({
  onBack,
  open,
  setOpen,
}: {
  onBack: () => void
  open: number | null
  setOpen: (i: number | null) => void
}) {
  return (
    <div className="flex flex-col min-h-[560px]">
      <div
        className="flex items-center gap-3 px-6 py-4 sticky top-0 z-10"
        style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}
      >
        <button onClick={onBack} style={{ color: C.muted }}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <div>
          <h2 className="text-base font-semibold" style={{ color: C.text }}>
            Manual Operacional
          </h2>
          <p className="text-xs" style={{ color: C.muted }}>
            Guia de problemas comuns
          </p>
        </div>
      </div>
      <div className="flex-1 p-4 space-y-2 overflow-y-auto">
        {MANUAL_ITEMS.map((item, i) => (
          <div
            key={i}
            className="rounded-xl overflow-hidden"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: C.dangerBg }}
                >
                  <svg
                    className="w-4 h-4"
                    style={{ color: C.primary }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <span className="font-semibold text-sm" style={{ color: C.text }}>
                  {item.title}
                </span>
              </div>
              <svg
                className="w-4 h-4 transition-transform shrink-0"
                style={{ color: C.muted, transform: open === i ? 'rotate(180deg)' : 'none' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {open === i && (
              <div className="px-5 pb-4 space-y-2" style={{ borderTop: `1px solid ${C.border}` }}>
                <p
                  className="text-xs font-mono uppercase tracking-wider pt-3 mb-2"
                  style={{ color: C.muted }}
                >
                  Procedimento
                </p>
                {item.steps.map((step, j) => (
                  <div key={j} className="flex items-start gap-3">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: C.primary }}
                    >
                      <span className="text-white font-mono text-[10px] font-bold">{j + 1}</span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: C.textSoft }}>
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Check-in ──────────────────────────────────────────────────────────────────
function CheckinScreen({
  onBack,
  checked,
  onToggle,
}: {
  onBack: () => void
  checked: Set<number>
  onToggle: (id: number) => void
}) {
  const groups = [...new Set(CHECKLIST_ITEMS.map((i) => i.group))]
  const total = CHECKLIST_ITEMS.length
  const done = checked.size

  return (
    <div className="flex flex-col min-h-[560px]">
      <div
        className="px-6 py-4 sticky top-0 z-10"
        style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}
      >
        <div className="flex items-center gap-3 mb-3">
          <button onClick={onBack} style={{ color: C.muted }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div className="flex-1">
            <h2 className="text-base font-semibold" style={{ color: C.text }}>
              Check-in — Inspeção
            </h2>
            <p className="text-xs" style={{ color: C.muted }}>
              {done}/{total} itens verificados
            </p>
          </div>
        </div>
        <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: C.border }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${(done / total) * 100}%`,
              background: done === total ? C.success : C.primary,
            }}
          />
        </div>
      </div>
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {groups.map((group) => (
          <div key={group}>
            <p
              className="text-xs font-mono uppercase tracking-widest mb-2 px-1"
              style={{ color: C.muted }}
            >
              {group}
            </p>
            <div
              className="rounded-xl overflow-hidden"
              style={{ background: C.card, border: `1px solid ${C.border}` }}
            >
              {CHECKLIST_ITEMS.filter((i) => i.group === group).map((item, idx, arr) => (
                <label
                  key={item.id}
                  className="flex items-center gap-4 px-5 py-3.5 cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ borderBottom: idx < arr.length - 1 ? `1px solid ${C.border}` : 'none' }}
                >
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center shrink-0 transition-all"
                    style={{
                      background: checked.has(item.id) ? C.success : C.bg,
                      border: `2px solid ${checked.has(item.id) ? C.success : C.border}`,
                    }}
                  >
                    {checked.has(item.id) && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <span
                    className="text-sm"
                    style={{
                      color: checked.has(item.id) ? C.muted : C.text,
                      textDecoration: checked.has(item.id) ? 'line-through' : 'none',
                    }}
                  >
                    {item.label}
                  </span>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={checked.has(item.id)}
                    onChange={() => onToggle(item.id)}
                  />
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Chat ──────────────────────────────────────────────────────────────────────
function ChatScreen({
  onBack,
  messages,
  input,
  setInput,
  onSend,
}: {
  onBack: () => void
  messages: typeof CHAT_MESSAGES
  input: string
  setInput: (v: string) => void
  onSend: () => void
}) {
  return (
    <div className="flex flex-col min-h-[560px]">
      <div className="px-6 py-4 sticky top-0 z-10" style={{ background: C.primary }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-white/70 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div className="flex-1">
            <h2 className="text-base font-semibold text-white">Chat de Emergência</h2>
            <p className="text-xs text-white/60">Apenas para uso em situações críticas</p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-white" />
            <span className="text-xs font-mono text-white/70 uppercase tracking-wider">
              Ao vivo
            </span>
          </div>
        </div>
      </div>

      <div
        className="px-5 py-3"
        style={{ background: '#fff3cd', borderBottom: `1px solid #ffd866` }}
      >
        <p className="text-xs font-semibold" style={{ color: '#92400e' }}>
          ⚠ Canal de emergência — use apenas em último caso. Todas as mensagens são registradas.
        </p>
      </div>

      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.mine ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-xs">
              <p
                className="text-[10px] font-mono mb-1"
                style={{ color: C.muted, textAlign: msg.mine ? 'right' : 'left' }}
              >
                {msg.sender} · {msg.time}
              </p>
              <div
                className="rounded-2xl px-4 py-2.5"
                style={{
                  background: msg.mine ? C.primary : C.card,
                  border: msg.mine ? 'none' : `1px solid ${C.border}`,
                  borderBottomRightRadius: msg.mine ? 4 : undefined,
                  borderBottomLeftRadius: !msg.mine ? 4 : undefined,
                }}
              >
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: msg.mine ? 'white' : C.text }}
                >
                  {msg.text}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 pb-4 pt-2 flex gap-2" style={{ borderTop: `1px solid ${C.border}` }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Mensagem de emergência..."
          style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.text }}
          className="flex-1 rounded-xl px-4 py-3 text-sm placeholder-[#bbb] focus:outline-none"
          onFocus={(e) => {
            e.target.style.borderColor = C.primary
          }}
          onBlur={(e) => {
            e.target.style.borderColor = C.border
          }}
          onKeyDown={(e) => e.key === 'Enter' && onSend()}
        />
        <button
          onClick={onSend}
          className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 hover:opacity-90"
          style={{ background: C.primary }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

// ── Bottom Nav ────────────────────────────────────────────────────────────────
function BottomNav({
  active,
  onNav,
  hasCcoAlert,
}: {
  active: NavTab
  onNav: (t: NavTab) => void
  hasCcoAlert: boolean
}) {
  const tabs: { key: NavTab; label: string; icon: (a: boolean) => React.ReactNode }[] = [
    {
      key: 'home',
      label: 'Início',
      icon: () => (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      key: 'diary',
      label: 'Diário',
      icon: () => (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      key: 'cp',
      label: 'CP',
      icon: () => (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
          />
        </svg>
      ),
    },
    {
      key: 'cco',
      label: 'CCO',
      icon: () => (
        <div className="relative">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
            />
          </svg>
          {hasCcoAlert && (
            <div
              className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ring-2 ring-white"
              style={{ background: C.danger }}
            />
          )}
        </div>
      ),
    },
    {
      key: 'history',
      label: 'Histórico',
      icon: () => (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      key: 'profile',
      label: 'Perfil',
      icon: () => (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
  ]

  return (
    <div style={{ borderTop: `1px solid ${C.border}`, background: C.navBg }} className="px-1 py-1">
      <div className="flex items-center justify-around">
        {tabs.map(({ key, label, icon }) => {
          const isActive = active === key
          return (
            <button
              key={key}
              onClick={() => onNav(key)}
              className="flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl transition-all min-w-[52px]"
              style={{ color: isActive ? C.primary : '#aaaaaa' }}
            >
              {icon(isActive)}
              <span className="text-[9px] font-mono uppercase tracking-wider">{label}</span>
              {isActive && (
                <div className="w-3 h-0.5 rounded-full" style={{ background: C.primary }} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Icon helpers ──────────────────────────────────────────────────────────────
function DiaryIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  )
}
function MicIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
      />
    </svg>
  )
}
function CcoIcon({ alert }: { alert?: boolean }) {
  return (
    <div className="relative">
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
        />
      </svg>
      {alert && (
        <div
          className="absolute -top-1 -right-1 w-2 h-2 rounded-full animate-pulse"
          style={{ background: C.danger }}
        />
      )}
    </div>
  )
}
function HistoryIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  )
}
function ManualIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    </svg>
  )
}
function CheckIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
      />
    </svg>
  )
}
function ChatIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  )
}
