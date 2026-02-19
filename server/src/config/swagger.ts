import type { JsonObject } from 'swagger-ui-express'

// ============ OPENAPI 3.0 SPECIFICATION ============

export const swaggerSpec: JsonObject = {
  openapi: '3.0.3',
  info: {
    title: 'Realtime Chat API',
    version: '1.0.0',
    description:
      'API RESTful para chat em tempo real com salas, autenticação JWT, upload de arquivos e eventos Socket.io. Construído com Express 5, Prisma 7 e TypeScript.',
    contact: {
      name: 'Andriy Amaro',
      url: 'https://github.com/AndriyAmaro/realtime-chat',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: '/api/v1',
      description: 'API v1',
    },
  ],
  tags: [
    { name: 'Health', description: 'Server health check' },
    { name: 'Auth', description: 'Autenticação e gerenciamento de sessão' },
    { name: 'Rooms', description: 'CRUD de salas de chat' },
    { name: 'Members', description: 'Gerenciamento de membros das salas' },
    { name: 'Messages', description: 'Busca de mensagens' },
    { name: 'Uploads', description: 'Upload de arquivos e imagens' },
  ],

  // ============ PATHS ============

  paths: {
    // ---- Health ----

    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Verificar status do servidor',
        description: 'Retorna o status do servidor e da conexão com o banco de dados.',
        responses: {
          200: {
            description: 'Servidor e banco de dados operacionais',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            server: { type: 'string', example: 'ok' },
                            database: { type: 'string', example: 'ok' },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          503: {
            description: 'Banco de dados indisponível',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    data: {
                      type: 'object',
                      properties: {
                        server: { type: 'string', example: 'ok' },
                        database: { type: 'string', example: 'error' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ---- Auth ----

    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Registrar novo usuário',
        description:
          'Cria uma nova conta com nome, email e senha. Retorna o perfil do usuário e um access token JWT. O refresh token é enviado como cookie httpOnly.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterInput' },
              example: {
                name: 'João Silva',
                email: 'joao@example.com',
                password: 'senha123',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Usuário criado com sucesso',
            headers: {
              'Set-Cookie': {
                description: 'Refresh token em cookie httpOnly',
                schema: {
                  type: 'string',
                  example: 'refresh_token=eyJ...; HttpOnly; Path=/; Max-Age=604800',
                },
              },
            },
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          409: { $ref: '#/components/responses/Conflict' },
          422: { $ref: '#/components/responses/ValidationError' },
          429: { $ref: '#/components/responses/RateLimited' },
        },
      },
    },

    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Fazer login',
        description:
          'Autentica com email e senha. Retorna o perfil do usuário e um access token JWT. O refresh token é enviado como cookie httpOnly.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginInput' },
              example: {
                email: 'joao@example.com',
                password: 'senha123',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login realizado com sucesso',
            headers: {
              'Set-Cookie': {
                description: 'Refresh token em cookie httpOnly',
                schema: { type: 'string' },
              },
            },
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          422: { $ref: '#/components/responses/ValidationError' },
          429: { $ref: '#/components/responses/RateLimited' },
        },
      },
    },

    '/auth/refresh-token': {
      post: {
        tags: ['Auth'],
        summary: 'Renovar access token',
        description:
          'Usa o refresh token do cookie para gerar um novo par de tokens. Não requer Authorization header.',
        responses: {
          200: {
            description: 'Tokens renovados',
            headers: {
              'Set-Cookie': {
                description: 'Novo refresh token em cookie httpOnly',
                schema: { type: 'string' },
              },
            },
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Fazer logout',
        description: 'Limpa o cookie de refresh token, encerrando a sessão.',
        responses: {
          200: {
            description: 'Logout realizado',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            message: { type: 'string', example: 'Logged out successfully' },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },

    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Obter perfil do usuário autenticado',
        description: 'Retorna os dados do usuário autenticado pelo access token.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Perfil do usuário',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    {
                      type: 'object',
                      properties: {
                        data: { $ref: '#/components/schemas/UserProfile' },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    // ---- Rooms ----

    '/rooms': {
      post: {
        tags: ['Rooms'],
        summary: 'Criar nova sala',
        description:
          'Cria uma sala de chat. O criador é automaticamente adicionado como ADMIN. Salas privadas geram um código de convite.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateRoomInput' },
              example: {
                name: 'Dev Frontend',
                description: 'Discussões sobre React, Vue e Angular',
                isPrivate: false,
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Sala criada com sucesso',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    {
                      type: 'object',
                      properties: {
                        data: { $ref: '#/components/schemas/Room' },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          422: { $ref: '#/components/responses/ValidationError' },
        },
      },
      get: {
        tags: ['Rooms'],
        summary: 'Listar salas do usuário',
        description:
          'Retorna as salas das quais o usuário autenticado é membro, com paginação e busca.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/Page' },
          { $ref: '#/components/parameters/Limit' },
          { $ref: '#/components/parameters/Search' },
        ],
        responses: {
          200: {
            description: 'Lista de salas',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/Room' },
                        },
                        meta: { $ref: '#/components/schemas/PaginationMeta' },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    '/rooms/public': {
      get: {
        tags: ['Rooms'],
        summary: 'Descobrir salas públicas',
        description: 'Lista todas as salas públicas disponíveis, com paginação e busca por nome.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/Page' },
          { $ref: '#/components/parameters/Limit' },
          { $ref: '#/components/parameters/Search' },
        ],
        responses: {
          200: {
            description: 'Lista de salas públicas',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/Room' },
                        },
                        meta: { $ref: '#/components/schemas/PaginationMeta' },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    '/rooms/{roomId}': {
      get: {
        tags: ['Rooms'],
        summary: 'Detalhes de uma sala',
        description:
          'Retorna os detalhes de uma sala específica. O código de convite só é visível para owner/admin.',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/RoomId' }],
        responses: {
          200: {
            description: 'Detalhes da sala',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    {
                      type: 'object',
                      properties: {
                        data: { $ref: '#/components/schemas/RoomDetail' },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      patch: {
        tags: ['Rooms'],
        summary: 'Atualizar sala',
        description:
          'Atualiza nome, descrição ou visibilidade da sala. Apenas owner ou admin. Ao tornar privada, gera invite code automaticamente.',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/RoomId' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateRoomInput' },
              example: {
                name: 'Dev Frontend (Atualizado)',
                isPrivate: true,
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Sala atualizada',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    {
                      type: 'object',
                      properties: {
                        data: { $ref: '#/components/schemas/Room' },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          422: { $ref: '#/components/responses/ValidationError' },
        },
      },
      delete: {
        tags: ['Rooms'],
        summary: 'Excluir sala',
        description:
          'Remove permanentemente a sala e todos os dados associados. Apenas o owner pode excluir.',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/RoomId' }],
        responses: {
          204: { description: 'Sala excluída com sucesso' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    '/rooms/{roomId}/join': {
      post: {
        tags: ['Rooms'],
        summary: 'Entrar em uma sala',
        description:
          'Adiciona o usuário autenticado como membro da sala. Salas públicas não exigem código. Salas privadas exigem o invite code.',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/RoomId' }],
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/JoinRoomInput' },
              example: { inviteCode: 'a1b2c3d4' },
            },
          },
        },
        responses: {
          201: {
            description: 'Entrou na sala com sucesso',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    {
                      type: 'object',
                      properties: {
                        data: { $ref: '#/components/schemas/RoomMember' },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          409: { $ref: '#/components/responses/Conflict' },
        },
      },
    },

    '/rooms/{roomId}/leave': {
      post: {
        tags: ['Rooms'],
        summary: 'Sair de uma sala',
        description:
          'Remove o usuário autenticado da sala. O owner não pode sair — deve excluir a sala.',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/RoomId' }],
        responses: {
          204: { description: 'Saiu da sala com sucesso' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: {
            description: 'Owner não pode sair da sala',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    '/rooms/{roomId}/members': {
      get: {
        tags: ['Members'],
        summary: 'Listar membros da sala',
        description: 'Retorna todos os membros de uma sala com seus perfis e cargos.',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/RoomId' }],
        responses: {
          200: {
            description: 'Lista de membros',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/RoomMemberWithUser' },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    '/rooms/{roomId}/members/{memberId}': {
      patch: {
        tags: ['Members'],
        summary: 'Alterar cargo de um membro',
        description:
          'Altera o cargo de um membro (ADMIN ou MEMBER). Requer permissão de admin/owner. Não é possível alterar o próprio cargo nem o cargo do owner.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/RoomId' },
          { $ref: '#/components/parameters/MemberId' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateMemberRoleInput' },
              example: { role: 'ADMIN' },
            },
          },
        },
        responses: {
          200: {
            description: 'Cargo atualizado',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    {
                      type: 'object',
                      properties: {
                        data: { $ref: '#/components/schemas/RoomMember' },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          422: { $ref: '#/components/responses/ValidationError' },
        },
      },
      delete: {
        tags: ['Members'],
        summary: 'Remover membro da sala',
        description: 'Remove um membro da sala. Requer permissão de admin/owner.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/RoomId' },
          { $ref: '#/components/parameters/MemberId' },
        ],
        responses: {
          204: { description: 'Membro removido com sucesso' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    '/rooms/{roomId}/invite-code': {
      post: {
        tags: ['Rooms'],
        summary: 'Regenerar código de convite',
        description:
          'Gera um novo código de convite de 8 caracteres hexadecimais para salas privadas. Requer permissão de admin/owner.',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/RoomId' }],
        responses: {
          200: {
            description: 'Novo código gerado',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            inviteCode: { type: 'string', example: 'a1b2c3d4' },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    // ---- Messages ----

    '/rooms/{roomId}/messages/search': {
      get: {
        tags: ['Messages'],
        summary: 'Buscar mensagens na sala',
        description:
          'Busca case-insensitive no conteúdo das mensagens de uma sala. Requer ser membro da sala. Paginação offset-based.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/RoomId' },
          {
            name: 'q',
            in: 'query',
            required: true,
            description: 'Termo de busca (1-100 caracteres)',
            schema: { type: 'string', minLength: 1, maxLength: 100 },
            example: 'hello',
          },
          { $ref: '#/components/parameters/Page' },
          { $ref: '#/components/parameters/Limit' },
        ],
        responses: {
          200: {
            description: 'Resultados da busca',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            messages: {
                              type: 'array',
                              items: { $ref: '#/components/schemas/Message' },
                            },
                            page: { type: 'integer', example: 1 },
                            limit: { type: 'integer', example: 20 },
                            total: { type: 'integer', example: 5 },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          422: { $ref: '#/components/responses/ValidationError' },
        },
      },
    },

    // ---- Uploads ----

    '/uploads': {
      post: {
        tags: ['Uploads'],
        summary: 'Fazer upload de arquivo',
        description:
          'Faz upload de um arquivo (imagem, PDF, texto, documento Word ou ZIP). Tamanho máximo: 5MB. O arquivo é salvo no servidor e a URL retornada pode ser usada em mensagens.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['file'],
                properties: {
                  file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Arquivo para upload (max 5MB)',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Upload realizado com sucesso',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    {
                      type: 'object',
                      properties: {
                        data: { $ref: '#/components/schemas/UploadResult' },
                      },
                    },
                  ],
                },
              },
            },
          },
          400: {
            description: 'Nenhum arquivo enviado ou tipo não permitido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          413: {
            description: 'Arquivo excede o tamanho máximo (5MB)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
  },

  // ============ COMPONENTS ============

  components: {
    // ---- Security Schemes ----

    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Access token JWT obtido via login ou registro. Expira em 15 minutos.',
      },
    },

    // ---- Parameters ----

    parameters: {
      RoomId: {
        name: 'roomId',
        in: 'path',
        required: true,
        description: 'UUID da sala',
        schema: { type: 'string', format: 'uuid' },
      },
      MemberId: {
        name: 'memberId',
        in: 'path',
        required: true,
        description: 'UUID do membro',
        schema: { type: 'string', format: 'uuid' },
      },
      Page: {
        name: 'page',
        in: 'query',
        description: 'Número da página (1-based)',
        schema: { type: 'integer', minimum: 1, default: 1 },
      },
      Limit: {
        name: 'limit',
        in: 'query',
        description: 'Itens por página (max 50)',
        schema: { type: 'integer', minimum: 1, maximum: 50, default: 20 },
      },
      Search: {
        name: 'search',
        in: 'query',
        description: 'Filtrar por nome',
        schema: { type: 'string' },
      },
    },

    // ---- Schemas ----

    schemas: {
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'object' },
          error: { type: 'string' },
          meta: { $ref: '#/components/schemas/PaginationMeta' },
        },
        required: ['success'],
      },

      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: { type: 'string', example: 'Error message' },
        },
        required: ['success', 'error'],
      },

      ValidationErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: { type: 'string', example: 'Validation failed' },
          data: {
            type: 'object',
            additionalProperties: {
              type: 'array',
              items: { type: 'string' },
            },
            example: {
              email: ['Invalid email address'],
              password: ['Password must be at least 6 characters'],
            },
          },
        },
        required: ['success', 'error'],
      },

      PaginationMeta: {
        type: 'object',
        properties: {
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 20 },
          total: { type: 'integer', example: 50 },
          hasMore: { type: 'boolean', example: true },
        },
      },

      // ---- Auth Schemas ----

      RegisterInput: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 50, example: 'João Silva' },
          email: { type: 'string', format: 'email', example: 'joao@example.com' },
          password: {
            type: 'string',
            minLength: 6,
            maxLength: 128,
            format: 'password',
            example: 'senha123',
          },
        },
      },

      LoginInput: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'joao@example.com' },
          password: { type: 'string', format: 'password', example: 'senha123' },
        },
      },

      AuthResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'object',
            properties: {
              user: { $ref: '#/components/schemas/UserProfile' },
              accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
            },
          },
        },
      },

      UserProfile: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
          name: { type: 'string', example: 'João Silva' },
          email: { type: 'string', format: 'email', example: 'joao@example.com' },
          avatar: { type: 'string', nullable: true, example: null },
        },
      },

      // ---- Room Schemas ----

      CreateRoomInput: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 50, example: 'Dev Frontend' },
          description: {
            type: 'string',
            maxLength: 200,
            example: 'Discussões sobre React e TypeScript',
          },
          isPrivate: { type: 'boolean', default: false, example: false },
        },
      },

      UpdateRoomInput: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 50 },
          description: { type: 'string', maxLength: 200, nullable: true },
          isPrivate: { type: 'boolean' },
        },
      },

      JoinRoomInput: {
        type: 'object',
        properties: {
          inviteCode: {
            type: 'string',
            description: 'Código de convite (obrigatório para salas privadas)',
            example: 'a1b2c3d4',
          },
        },
      },

      UpdateMemberRoleInput: {
        type: 'object',
        required: ['role'],
        properties: {
          role: {
            type: 'string',
            enum: ['ADMIN', 'MEMBER'],
            example: 'ADMIN',
          },
        },
      },

      Room: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'Dev Frontend' },
          description: { type: 'string', nullable: true, example: 'Discussões sobre React' },
          isPrivate: { type: 'boolean', example: false },
          inviteCode: {
            type: 'string',
            nullable: true,
            description: 'Visível apenas para owner/admin',
            example: 'a1b2c3d4',
          },
          ownerId: { type: 'string', format: 'uuid' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },

      RoomDetail: {
        allOf: [
          { $ref: '#/components/schemas/Room' },
          {
            type: 'object',
            properties: {
              members: {
                type: 'array',
                items: { $ref: '#/components/schemas/RoomMemberWithUser' },
              },
              _count: {
                type: 'object',
                properties: {
                  messages: { type: 'integer', example: 42 },
                  members: { type: 'integer', example: 5 },
                },
              },
            },
          },
        ],
      },

      RoomMember: {
        type: 'object',
        properties: {
          userId: { type: 'string', format: 'uuid' },
          roomId: { type: 'string', format: 'uuid' },
          role: { type: 'string', enum: ['ADMIN', 'MEMBER'], example: 'MEMBER' },
          joinedAt: { type: 'string', format: 'date-time' },
        },
      },

      RoomMemberWithUser: {
        allOf: [
          { $ref: '#/components/schemas/RoomMember' },
          {
            type: 'object',
            properties: {
              user: { $ref: '#/components/schemas/UserProfile' },
            },
          },
        ],
      },

      // ---- Message Schemas ----

      Message: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          content: { type: 'string', example: 'Olá, pessoal!' },
          type: { type: 'string', enum: ['TEXT', 'IMAGE', 'FILE'], example: 'TEXT' },
          fileUrl: { type: 'string', nullable: true, example: null },
          userId: { type: 'string', format: 'uuid' },
          roomId: { type: 'string', format: 'uuid' },
          createdAt: { type: 'string', format: 'date-time' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string', example: 'João Silva' },
              avatar: { type: 'string', nullable: true },
            },
          },
        },
      },

      // ---- Upload Schemas ----

      UploadResult: {
        type: 'object',
        properties: {
          url: { type: 'string', example: '/uploads/a1b2c3d4e5f6.jpg' },
          filename: { type: 'string', example: 'a1b2c3d4e5f6.jpg' },
          originalName: { type: 'string', example: 'foto-perfil.jpg' },
          mimetype: { type: 'string', example: 'image/jpeg' },
          size: { type: 'integer', example: 245760, description: 'Tamanho em bytes' },
          isImage: { type: 'boolean', example: true },
        },
      },
    },

    // ---- Responses ----

    responses: {
      Unauthorized: {
        description: 'Token ausente ou inválido',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: { success: false, error: 'Access token required' },
          },
        },
      },
      Forbidden: {
        description: 'Sem permissão para esta ação',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: { success: false, error: 'You do not have permission to perform this action' },
          },
        },
      },
      NotFound: {
        description: 'Recurso não encontrado',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: { success: false, error: 'Resource not found' },
          },
        },
      },
      Conflict: {
        description: 'Conflito — recurso já existe',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: { success: false, error: 'Resource already exists' },
          },
        },
      },
      ValidationError: {
        description: 'Erro de validação nos dados enviados',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ValidationErrorResponse' },
          },
        },
      },
      RateLimited: {
        description: 'Muitas requisições — tente novamente mais tarde',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: { success: false, error: 'Too many requests, please try again later' },
          },
        },
      },
    },
  },
}
