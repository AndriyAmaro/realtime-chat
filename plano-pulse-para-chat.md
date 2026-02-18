# PLANO: O que copiar do Pulse para o projeto Chat

## A ideia central

O recrutador vai ver: *"Este dev criou um design system (Pulse) e reutilizou-o num projeto real de Chat em tempo real"* — isso mostra maturidade profissional.

---

## PASTAS/ARQUIVOS A COPIAR DO PULSE

### 1. Design Tokens & Estilos Globais

| Origem no Pulse | Destino no Chat | O que contém |
|---|---|---|
| `core/tokens/` | `client/src/core/tokens/` | Cores, espaçamento, tipografia, sombras, z-index, animações |
| `app/globals.css` | `client/src/globals.css` | CSS variables (dark/light mode), paleta completa Pulse |

### 2. Primitives (Componentes Atómicos) — TODOS

| Componente | Uso no Chat |
|---|---|
| `core/primitives/Button.tsx` | Enviar mensagem, criar sala, ações |
| `core/primitives/Input.tsx` | Campo de busca, inputs dos forms |
| `core/primitives/Avatar.tsx` | Avatar dos users com status online/offline/away |
| `core/primitives/Badge.tsx` | Contagem de mensagens não lidas |
| `core/primitives/Spinner.tsx` | Loading states |
| `core/primitives/Skeleton.tsx` | Skeleton loading (mensagens carregando) |
| `core/primitives/Checkbox.tsx` | Settings, "Lembrar-me" no login |
| `core/primitives/Switch.tsx` | Notificações on/off, dark mode |
| `core/primitives/Textarea.tsx` | Input de mensagens |
| `core/primitives/Select.tsx` | Filtros, selecionar sala |
| `core/primitives/Tooltip.tsx` | Tooltips em ícones |
| `core/primitives/Tag.tsx` | Tags nas salas |
| `core/primitives/Divider.tsx` | Separadores visuais |
| `core/primitives/ThemeToggle.tsx` | Dark/Light mode toggle |

### 3. Organisms (Componentes Complexos)

| Componente | Uso no Chat |
|---|---|
| `core/organisms/Card.tsx` | Cards de salas, containers |
| `core/organisms/Modal.tsx` | Criar sala, convidar membros, confirmar ações |
| `core/organisms/Drawer.tsx` | Painel lateral mobile, lista de membros |
| `core/organisms/DropdownMenu.tsx` | Menu de contexto (editar/apagar mensagem) |
| `core/organisms/Form.tsx` | Formulários (login, registro, criar sala) |

### 4. Patterns Relevantes

| Componente | Uso no Chat |
|---|---|
| `core/patterns/AuthBackground.tsx` | Background animado nas páginas de auth |
| `core/patterns/AuthCard.tsx` | Container dos forms de login/registro |
| `core/patterns/SocialLoginButtons.tsx` | Login social (Google, GitHub) |
| `core/patterns/PasswordInput.tsx` | Campo de senha com show/hide |
| `core/patterns/ChatUI.tsx` | **Base do chat inteiro!** (já tem mensagens, input, typing indicator) |
| `core/patterns/SearchBar.tsx` | Busca de mensagens e salas |
| `core/patterns/Toast.tsx` | Notificações toast |
| `core/patterns/Alert.tsx` | Alertas e avisos |
| `core/patterns/EmptyState.tsx` | Estado vazio (sem mensagens, sem salas) |
| `core/patterns/Tabs.tsx` | Tabs (salas públicas/privadas) |
| `core/patterns/FileUpload.tsx` | Upload de imagens/arquivos |
| `core/patterns/Pagination.tsx` | Paginação do histórico |

### 5. Layouts

| Componente | Uso no Chat |
|---|---|
| `core/layouts/Sidebar.tsx` | Lista de salas na sidebar |
| `core/layouts/Header.tsx` | Header com busca, notificações, perfil |
| `core/layouts/MainContent.tsx` | Container principal do chat |

### 6. Utilitários & Configuração

| Arquivo | Uso |
|---|---|
| `shared/utils/cn.ts` | Função `cn()` para merge de classes Tailwind |
| `shared/types/index.ts` | Types base (Size, Status, BaseProps, etc.) |

### 7. Páginas de Auth (como referência)

| Página | Para reutilizar |
|---|---|
| `app/[locale]/(auth)/login/` | Estrutura e design do login |
| `app/[locale]/(auth)/register/` | Estrutura e design do registro |
| `app/[locale]/(auth)/forgot-password/` | Recuperação de senha |

---

## O QUE NÃO COPIAR

- Dashboards específicos (ecommerce, finance, HR, etc.)
- Charts complexos (Recharts, GaugeChart, CandlestickChart)
- Patterns de negócio (OrderTicket, CryptoCard, PricingTable)
- Marketing patterns (HeroSection, CTABanner, FooterMarketing)
- i18n/locales (o chat terá a sua própria config de idiomas)
- `config/navigation.ts` (navegação diferente)
- Páginas de dashboard do Pulse

---

## ESTRUTURA FINAL DO NOVO REPOSITÓRIO

```
realtime-chat/
├── client/                        # Frontend React (Vite, não Next.js)
│   └── src/
│       ├── core/                  # << COPIADO DO PULSE (design system)
│       │   ├── tokens/
│       │   ├── primitives/        # Button, Input, Avatar, Badge, etc.
│       │   ├── organisms/         # Card, Modal, Drawer, Form
│       │   └── patterns/          # ChatUI, Auth*, Toast, SearchBar
│       ├── shared/                # << COPIADO DO PULSE
│       │   ├── utils/cn.ts
│       │   └── types/
│       ├── components/            # NOVOS componentes específicos do chat
│       │   ├── chat/
│       │   ├── rooms/
│       │   └── layout/
│       ├── hooks/                 # NOVOS hooks (useSocket, useAuth, etc.)
│       ├── services/              # NOVOS (API, Socket.io)
│       ├── store/                 # NOVOS (Zustand stores)
│       ├── pages/                 # NOVAS páginas
│       └── globals.css            # << COPIADO DO PULSE (design tokens)
├── server/                        # Backend (100% novo)
└── docker-compose.yml
```

---

## ADAPTAÇÕES NECESSÁRIAS APÓS COPIAR

1. **Next.js → React + Vite**: Remover dependências do Next.js (`next-themes` → implementação própria, `next-intl` → remover ou substituir)
2. **Imports**: Ajustar caminhos de importação para a nova estrutura
3. **ChatUI**: Expandir o pattern existente para funcionar com Socket.io real (hoje é apenas visual)
4. **Sidebar**: Adaptar para listar salas em vez de menus de navegação
5. **Header**: Simplificar para o contexto do chat

---

## POR QUE ESTE PLANO IMPRESSIONA RECRUTADORES

- Mostra que criaste um **design system reutilizável** (Pulse)
- Mostra que sabes **extrair e adaptar** componentes entre projetos
- O README do Chat pode dizer: *"UI built with Pulse Design System"* com link para o outro repo
- Demonstra pensamento de **arquitetura** e **reutilização de código**
