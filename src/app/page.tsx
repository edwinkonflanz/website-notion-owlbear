"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Plus, Users, Copy, Check, Moon, Sun, LogOut, Search, 
  ChevronRight, ChevronDown, FileText, Trash2, GripVertical,
  Code, Quote, AlertCircle, ChevronUp, Table, Image as ImageIcon,
  Bold, Italic, Underline, Link as LinkIcon, Hash, List, ListOrdered,
  MoreHorizontal, Settings, Star, Clock, Share2, Command
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

// Types
type BlockType = "heading1" | "heading2" | "heading3" | "text" | "list" | "numbered" | "divider" | "image" | "code" | "quote" | "callout" | "toggle" | "table";

interface Block {
  id: string;
  type: BlockType;
  content: string;
}

interface Page {
  id: string;
  title: string;
  icon: string;
  isFavorite: boolean;
  isExpanded: boolean;
  children: Page[];
  blocks: Block[];
}

interface Room {
  code: string;
  pages: Page[];
  lastSaved: string;
  createdAt: string;
}

// Sistema de armazenamento global para salas
const ROOMS_STORAGE_KEY = "notionspace_rooms";

// Funções auxiliares para gerenciar salas globalmente
const getAllRooms = (): Record<string, Room> => {
  if (typeof window === "undefined") return {};
  try {
    const data = localStorage.getItem(ROOMS_STORAGE_KEY);
    const rooms = data ? JSON.parse(data) : {};
    console.log("📦 Todas as salas carregadas:", Object.keys(rooms));
    return rooms;
  } catch (error) {
    console.error("❌ Erro ao carregar salas:", error);
    return {};
  }
};

const saveRoom = (room: Room) => {
  if (typeof window === "undefined") return;
  try {
    const rooms = getAllRooms();
    rooms[room.code] = room;
    localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(rooms));
    console.log(`✅ Sala ${room.code} salva com sucesso!`, room);
    
    // Verificação imediata
    const verificacao = getAllRooms();
    console.log("🔍 Verificação pós-salvamento:", verificacao[room.code] ? "OK" : "FALHOU");
  } catch (error) {
    console.error("❌ Erro ao salvar sala:", error);
  }
};

const getRoom = (code: string): Room | null => {
  try {
    const rooms = getAllRooms();
    const room = rooms[code];
    console.log(`🔍 Buscando sala ${code}:`, room ? "✅ Encontrada" : "❌ Não encontrada");
    if (room) {
      console.log("📄 Dados da sala:", room);
    }
    return room || null;
  } catch (error) {
    console.error("❌ Erro ao buscar sala:", error);
    return null;
  }
};

export default function Home() {
  const [currentView, setCurrentView] = useState<"home" | "editor">("home");
  const [roomCode, setRoomCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [username, setUsername] = useState("");
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateRoom = () => {
    if (!username.trim()) {
      alert("Por favor, insira seu nome");
      return;
    }
    const code = generateRoomCode();
    console.log("🎉 Criando nova sala com código:", code);
    
    // Criar sala inicial no armazenamento global
    const initialRoom: Room = {
      code,
      pages: [
        { 
          id: "main", 
          title: "Página Principal", 
          icon: "📄", 
          isFavorite: false, 
          isExpanded: true, 
          children: [],
          blocks: [
            { id: "1", type: "heading1", content: "Bem-vindo ao NotionSpace!" },
            { id: "2", type: "text", content: "Comece a escrever suas ideias aqui. Use / para ver todos os comandos disponíveis." },
          ]
        }
      ],
      lastSaved: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    // Salvar sala imediatamente
    saveRoom(initialRoom);
    
    // Verificar se foi salva
    setTimeout(() => {
      const verificacao = getRoom(code);
      if (verificacao) {
        console.log("✅ Sala verificada e confirmada!");
        setRoomCode(code);
        setCurrentView("editor");
      } else {
        console.error("❌ ERRO: Sala não foi salva corretamente!");
        alert("Erro ao criar sala. Tente novamente.");
      }
    }, 100);
  };

  const handleJoinRoom = () => {
    if (!username.trim() || !joinCode.trim()) {
      alert("Por favor, preencha todos os campos");
      return;
    }
    
    const codeUpper = joinCode.toUpperCase().trim();
    console.log("🚪 Tentando entrar na sala:", codeUpper);
    
    // Debug: mostrar todas as salas disponíveis
    const allRooms = getAllRooms();
    console.log("📋 Salas disponíveis:", Object.keys(allRooms));
    
    // Verificar se a sala existe no armazenamento global
    const room = getRoom(codeUpper);
    if (!room) {
      const availableRooms = Object.keys(allRooms);
      alert(
        `❌ Sala não encontrada!\n\n` +
        `Código digitado: ${codeUpper}\n` +
        `Salas disponíveis: ${availableRooms.length > 0 ? availableRooms.join(", ") : "Nenhuma sala criada ainda"}\n\n` +
        `Verifique se o código está correto.`
      );
      return;
    }
    
    console.log("✅ Sala encontrada! Entrando...");
    setRoomCode(codeUpper);
    setCurrentView("editor");
    setShowJoinDialog(false);
  };

  const handleLeaveRoom = () => {
    setCurrentView("home");
    setRoomCode("");
    setJoinCode("");
  };

  if (currentView === "home") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300">
        {/* Header */}
        <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">NotionSpace</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Anotações Colaborativas Avançadas</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Colabore em tempo real
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Crie espaços compartilhados com todas as funcionalidades do Notion. Edite junto com sua equipe em tempo real.
            </p>
          </div>

          {/* Username Input */}
          <Card className="mb-8 border-2">
            <CardHeader>
              <CardTitle className="text-center">Identifique-se</CardTitle>
              <CardDescription className="text-center">
                Digite seu nome para começar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Seu nome"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="text-center text-lg h-12"
                maxLength={20}
              />
            </CardContent>
          </Card>

          {/* Action Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Create Room */}
            <Card className="border-2 hover:shadow-xl transition-all duration-300 cursor-pointer group">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Plus className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Criar Nova Nota</CardTitle>
                <CardDescription>
                  Inicie um novo espaço colaborativo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleCreateRoom}
                  disabled={!username.trim()}
                  className="w-full h-12 text-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                >
                  Criar Espaço
                </Button>
              </CardContent>
            </Card>

            {/* Join Room */}
            <Card className="border-2 hover:shadow-xl transition-all duration-300 cursor-pointer group">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Entrar em Nota</CardTitle>
                <CardDescription>
                  Use um código para acessar um espaço existente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setShowJoinDialog(true)}
                  disabled={!username.trim()}
                  variant="outline"
                  className="w-full h-12 text-lg border-2"
                >
                  Entrar com Código
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Features */}
          <div className="mt-16 grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Autosave</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Salva automaticamente
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Colaboração</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Tempo real
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Code className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Blocos Ricos</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Código, tabelas, mais
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Busca</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Encontre tudo
              </p>
            </div>
          </div>
        </main>

        {/* Join Dialog */}
        <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Entrar em um Espaço</DialogTitle>
              <DialogDescription>
                Digite o código de 6 caracteres compartilhado com você
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Código (ex: ABC123)"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="text-center text-lg h-12 uppercase"
                maxLength={6}
              />
              <Button
                onClick={handleJoinRoom}
                disabled={joinCode.length !== 6}
                className="w-full h-12 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
              >
                Entrar no Espaço
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <EditorView
      roomCode={roomCode}
      username={username}
      onLeave={handleLeaveRoom}
      theme={theme}
      toggleTheme={toggleTheme}
    />
  );
}

// Editor Component
function EditorView({
  roomCode,
  username,
  onLeave,
  theme,
  toggleTheme,
}: {
  roomCode: string;
  username: string;
  onLeave: () => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
}) {
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPageId, setCurrentPageId] = useState("main");
  const [onlineUsers, setOnlineUsers] = useState<string[]>([username]);
  const [copied, setCopied] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  const [showSidebar, setShowSidebar] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [showCommandsDialog, setShowCommandsDialog] = useState(false);

  // Carregar sala do armazenamento global
  useEffect(() => {
    console.log("📂 Carregando sala:", roomCode);
    const loadRoom = () => {
      const room = getRoom(roomCode);
      if (room) {
        setPages(room.pages);
        setLastSaved(new Date(room.lastSaved));
        console.log("✅ Sala carregada com sucesso:", room);
      } else {
        console.error("❌ ERRO: Sala não encontrada ao carregar:", roomCode);
        alert("Erro ao carregar sala. Voltando para tela inicial.");
        onLeave();
      }
    };
    loadRoom();
  }, [roomCode, onLeave]);

  // Salvar automaticamente no armazenamento global
  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (pages.length > 0) {
        const existingRoom = getRoom(roomCode);
        const room: Room = {
          code: roomCode,
          pages,
          lastSaved: new Date().toISOString(),
          createdAt: existingRoom?.createdAt || new Date().toISOString()
        };
        saveRoom(room);
        setLastSaved(new Date());
        console.log("💾 Autosave executado");
      }
    }, 3000);

    return () => clearInterval(saveInterval);
  }, [pages, roomCode]);

  // Simular usuários online
  useEffect(() => {
    const simulateUsers = () => {
      const randomUsers = ["Ana", "Bruno", "Carlos", "Diana", "Eduardo"];
      const numUsers = Math.floor(Math.random() * 3) + 1;
      const users = [username];
      for (let i = 0; i < numUsers; i++) {
        const randomUser = randomUsers[Math.floor(Math.random() * randomUsers.length)];
        if (!users.includes(randomUser)) {
          users.push(randomUser);
        }
      }
      setOnlineUsers(users);
    };

    const interval = setInterval(simulateUsers, 5000);
    return () => clearInterval(interval);
  }, [username]);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCurrentPage = () => {
    return pages.find(p => p.id === currentPageId) || pages[0];
  };

  const updateCurrentPageBlocks = (blocks: Block[]) => {
    setPages(pages.map(p => 
      p.id === currentPageId ? { ...p, blocks } : p
    ));
  };

  const addBlock = (type: BlockType, index?: number) => {
    const currentPage = getCurrentPage();
    if (!currentPage) return;

    const newBlock: Block = {
      id: Date.now().toString(),
      type,
      content: type === "divider" ? "" : type === "code" ? "// Digite seu código aqui" : type === "table" ? JSON.stringify([[" ", " "], [" ", " "]]) : "Digite aqui...",
    };
    
    const blocks = currentPage.blocks || [];
    if (index !== undefined) {
      const newBlocks = [...blocks];
      newBlocks.splice(index + 1, 0, newBlock);
      updateCurrentPageBlocks(newBlocks);
    } else {
      updateCurrentPageBlocks([...blocks, newBlock]);
    }
  };

  const updateBlock = (id: string, content: string) => {
    const currentPage = getCurrentPage();
    if (!currentPage) return;
    
    const blocks = currentPage.blocks || [];
    updateCurrentPageBlocks(blocks.map((block) => (block.id === id ? { ...block, content } : block)));
  };

  const deleteBlock = (id: string) => {
    const currentPage = getCurrentPage();
    if (!currentPage) return;
    
    const blocks = currentPage.blocks || [];
    updateCurrentPageBlocks(blocks.filter((block) => block.id !== id));
  };

  const duplicateBlock = (id: string) => {
    const currentPage = getCurrentPage();
    if (!currentPage) return;
    
    const blocks = currentPage.blocks || [];
    const blockIndex = blocks.findIndex(b => b.id === id);
    if (blockIndex !== -1) {
      const block = blocks[blockIndex];
      const newBlock = { ...block, id: Date.now().toString() };
      const newBlocks = [...blocks];
      newBlocks.splice(blockIndex + 1, 0, newBlock);
      updateCurrentPageBlocks(newBlocks);
    }
  };

  const moveBlock = (fromIndex: number, toIndex: number) => {
    const currentPage = getCurrentPage();
    if (!currentPage) return;
    
    const blocks = currentPage.blocks || [];
    const newBlocks = [...blocks];
    const [movedBlock] = newBlocks.splice(fromIndex, 1);
    newBlocks.splice(toIndex, 0, movedBlock);
    updateCurrentPageBlocks(newBlocks);
  };

  const handleDragStart = (e: React.DragEvent, blockId: string) => {
    setDraggedBlockId(blockId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetBlockId: string) => {
    e.preventDefault();
    if (!draggedBlockId) return;

    const currentPage = getCurrentPage();
    if (!currentPage) return;
    
    const blocks = currentPage.blocks || [];
    const fromIndex = blocks.findIndex(b => b.id === draggedBlockId);
    const toIndex = blocks.findIndex(b => b.id === targetBlockId);

    if (fromIndex !== -1 && toIndex !== -1) {
      moveBlock(fromIndex, toIndex);
    }
    setDraggedBlockId(null);
  };

  const addPage = () => {
    const newPage: Page = {
      id: Date.now().toString(),
      title: "Nova Página",
      icon: "📄",
      isFavorite: false,
      isExpanded: false,
      children: [],
      blocks: []
    };
    setPages([...pages, newPage]);
  };

  const toggleFavorite = (pageId: string) => {
    setPages(pages.map(p => p.id === pageId ? { ...p, isFavorite: !p.isFavorite } : p));
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  const currentPage = getCurrentPage();
  const blocks = currentPage?.blocks || [];
  
  const filteredBlocks = searchQuery
    ? blocks.filter(b => b.content.toLowerCase().includes(searchQuery.toLowerCase()))
    : blocks;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300 flex">
      {/* Sidebar */}
      {showSidebar && (
        <aside className="w-64 border-r bg-white dark:bg-gray-900 flex flex-col h-screen sticky top-0">
          <div className="p-4 border-b">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-gray-100">NotionSpace</span>
            </div>
            
            <div className="space-y-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => setShowSearch(!showSearch)}
              >
                <Search className="w-4 h-4" />
                Buscar
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => setShowCommandsDialog(true)}
              >
                <Command className="w-4 h-4" />
                Comandos
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            <div className="mb-4">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 mb-2">
                FAVORITOS
              </div>
              {pages.filter(p => p.isFavorite).map(page => (
                <PageItem
                  key={page.id}
                  page={page}
                  isActive={currentPageId === page.id}
                  onClick={() => setCurrentPageId(page.id)}
                  onToggleFavorite={() => toggleFavorite(page.id)}
                />
              ))}
            </div>

            <div>
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 mb-2">
                PÁGINAS
              </div>
              {pages.map(page => (
                <PageItem
                  key={page.id}
                  page={page}
                  isActive={currentPageId === page.id}
                  onClick={() => setCurrentPageId(page.id)}
                  onToggleFavorite={() => toggleFavorite(page.id)}
                />
              ))}
            </div>
          </div>

          <div className="p-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={addPage}
            >
              <Plus className="w-4 h-4" />
              Nova Página
            </Button>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Header */}
        <header className="border-b bg-white dark:bg-gray-900 sticky top-0 z-50 shadow-sm">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSidebar(!showSidebar)}
                >
                  <ChevronRight className={`w-5 h-5 transition-transform ${showSidebar ? 'rotate-180' : ''}`} />
                </Button>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Espaço Colaborativo
                    </h1>
                    <Badge variant="outline" className="font-mono">
                      {roomCode}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyRoomCode}
                      className="h-7 px-2"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Salvo às {formatTime(lastSaved)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Online Users */}
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {onlineUsers.slice(0, 3).map((user, index) => (
                      <div
                        key={index}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold border-2 border-white dark:border-gray-900"
                        title={user}
                      >
                        {user.charAt(0).toUpperCase()}
                      </div>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {onlineUsers.length} online
                  </span>
                </div>

                <Button variant="ghost" size="icon" onClick={toggleTheme}>
                  {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </Button>

                <Button variant="ghost" size="icon" onClick={onLeave}>
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Search Bar */}
        {showSearch && (
          <div className="p-4 border-b bg-white dark:bg-gray-900">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar em todas as páginas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        )}

        {/* Editor */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="space-y-1">
              {filteredBlocks.map((block, index) => (
                <BlockComponent
                  key={block.id}
                  block={block}
                  onUpdate={updateBlock}
                  onDelete={deleteBlock}
                  onDuplicate={duplicateBlock}
                  onAddBlock={(type) => addBlock(type, index)}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                />
              ))}
            </div>

            {/* Add Block Menu */}
            <div className="mt-8">
              <SlashCommandMenu onSelectBlock={addBlock} />
            </div>
          </div>
        </main>
      </div>

      {/* Commands Dialog */}
      <Dialog open={showCommandsDialog} onOpenChange={setShowCommandsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Command className="w-5 h-5" />
              Comandos do Sistema
            </DialogTitle>
            <DialogDescription>
              Todos os comandos disponíveis para criar blocos de conteúdo
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 pt-4">
            {/* Texto e Títulos */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Texto e Títulos
              </h3>
              <div className="grid gap-2">
                <CommandItem
                  icon={<Hash className="w-4 h-4" />}
                  title="Título 1"
                  description="Título grande para seções principais"
                  shortcut="/h1"
                />
                <CommandItem
                  icon={<Hash className="w-4 h-4" />}
                  title="Título 2"
                  description="Título médio para subseções"
                  shortcut="/h2"
                />
                <CommandItem
                  icon={<Hash className="w-4 h-4" />}
                  title="Título 3"
                  description="Título pequeno para detalhes"
                  shortcut="/h3"
                />
                <CommandItem
                  icon={<FileText className="w-4 h-4" />}
                  title="Texto"
                  description="Parágrafo de texto simples"
                  shortcut="/text"
                />
              </div>
            </div>

            {/* Listas */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <List className="w-4 h-4" />
                Listas
              </h3>
              <div className="grid gap-2">
                <CommandItem
                  icon={<List className="w-4 h-4" />}
                  title="Lista com Marcadores"
                  description="Lista simples com bullets"
                  shortcut="/list"
                />
                <CommandItem
                  icon={<ListOrdered className="w-4 h-4" />}
                  title="Lista Numerada"
                  description="Lista ordenada com números"
                  shortcut="/numbered"
                />
                <CommandItem
                  icon={<ChevronDown className="w-4 h-4" />}
                  title="Toggle"
                  description="Lista recolhível/expansível"
                  shortcut="/toggle"
                />
              </div>
            </div>

            {/* Blocos Especiais */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <Code className="w-4 h-4" />
                Blocos Especiais
              </h3>
              <div className="grid gap-2">
                <CommandItem
                  icon={<Code className="w-4 h-4" />}
                  title="Código"
                  description="Bloco de código com syntax highlighting"
                  shortcut="/code"
                />
                <CommandItem
                  icon={<Quote className="w-4 h-4" />}
                  title="Citação"
                  description="Citação destacada com borda lateral"
                  shortcut="/quote"
                />
                <CommandItem
                  icon={<AlertCircle className="w-4 h-4" />}
                  title="Callout"
                  description="Caixa de destaque para informações importantes"
                  shortcut="/callout"
                />
              </div>
            </div>

            {/* Mídia e Layout */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Mídia e Layout
              </h3>
              <div className="grid gap-2">
                <CommandItem
                  icon={<ImageIcon className="w-4 h-4" />}
                  title="Imagem"
                  description="Inserir imagem via URL"
                  shortcut="/image"
                />
                <CommandItem
                  icon={<Table className="w-4 h-4" />}
                  title="Tabela"
                  description="Tabela editável com linhas e colunas"
                  shortcut="/table"
                />
                <CommandItem
                  icon={<MoreHorizontal className="w-4 h-4" />}
                  title="Divisor"
                  description="Linha horizontal para separar conteúdo"
                  shortcut="/divider"
                />
              </div>
            </div>

            {/* Formatação de Texto */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <Bold className="w-4 h-4" />
                Formatação de Texto
              </h3>
              <div className="grid gap-2">
                <CommandItem
                  icon={<Bold className="w-4 h-4" />}
                  title="Negrito"
                  description="Selecione texto e clique no ícone de negrito"
                  shortcut="**texto**"
                />
                <CommandItem
                  icon={<Italic className="w-4 h-4" />}
                  title="Itálico"
                  description="Selecione texto e clique no ícone de itálico"
                  shortcut="*texto*"
                />
                <CommandItem
                  icon={<Underline className="w-4 h-4" />}
                  title="Sublinhado"
                  description="Selecione texto e clique no ícone de sublinhado"
                  shortcut="__texto__"
                />
                <CommandItem
                  icon={<LinkIcon className="w-4 h-4" />}
                  title="Link"
                  description="Selecione texto e clique no ícone de link"
                  shortcut="[texto](url)"
                />
              </div>
            </div>

            {/* Atalhos do Sistema */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Atalhos do Sistema
              </h3>
              <div className="grid gap-2">
                <CommandItem
                  icon={<GripVertical className="w-4 h-4" />}
                  title="Arrastar Bloco"
                  description="Clique e arraste o ícone de grip para reordenar"
                  shortcut="Drag & Drop"
                />
                <CommandItem
                  icon={<Copy className="w-4 h-4" />}
                  title="Duplicar Bloco"
                  description="Clique no menu ⋯ e selecione Duplicar"
                  shortcut="Menu > Duplicar"
                />
                <CommandItem
                  icon={<Trash2 className="w-4 h-4" />}
                  title="Deletar Bloco"
                  description="Clique no menu ⋯ e selecione Deletar"
                  shortcut="Menu > Deletar"
                />
                <CommandItem
                  icon={<Star className="w-4 h-4" />}
                  title="Favoritar Página"
                  description="Clique na estrela ao lado do nome da página"
                  shortcut="Sidebar"
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Command Item Component
function CommandItem({
  icon,
  title,
  description,
  shortcut,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  shortcut: string;
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
      <div className="w-8 h-8 bg-white dark:bg-gray-900 rounded-md flex items-center justify-center flex-shrink-0 border border-gray-200 dark:border-gray-700">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
          {title}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {description}
        </div>
      </div>
      <Badge variant="secondary" className="font-mono text-xs flex-shrink-0">
        {shortcut}
      </Badge>
    </div>
  );
}

// Page Item Component
function PageItem({
  page,
  isActive,
  onClick,
  onToggleFavorite,
}: {
  page: Page;
  isActive: boolean;
  onClick: () => void;
  onToggleFavorite: () => void;
}) {
  return (
    <div
      className={`group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${
        isActive ? "bg-gray-100 dark:bg-gray-800" : ""
      }`}
      onClick={onClick}
    >
      <span className="text-sm">{page.icon}</span>
      <span className="flex-1 text-sm text-gray-900 dark:text-gray-100 truncate">
        {page.title}
      </span>
      <Button
        variant="ghost"
        size="sm"
        className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite();
        }}
      >
        <Star className={`w-3 h-3 ${page.isFavorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
      </Button>
    </div>
  );
}

// Slash Command Menu Component
function SlashCommandMenu({ onSelectBlock }: { onSelectBlock: (type: BlockType) => void }) {
  const [showMenu, setShowMenu] = useState(false);
  const [slashInput, setSlashInput] = useState("");

  const commands = [
    { type: "heading1" as BlockType, label: "Título 1", icon: <Hash className="w-4 h-4" />, description: "Título grande" },
    { type: "heading2" as BlockType, label: "Título 2", icon: <Hash className="w-4 h-4" />, description: "Título médio" },
    { type: "heading3" as BlockType, label: "Título 3", icon: <Hash className="w-4 h-4" />, description: "Título pequeno" },
    { type: "text" as BlockType, label: "Texto", icon: <FileText className="w-4 h-4" />, description: "Parágrafo simples" },
    { type: "list" as BlockType, label: "Lista", icon: <List className="w-4 h-4" />, description: "Lista com marcadores" },
    { type: "numbered" as BlockType, label: "Lista Numerada", icon: <ListOrdered className="w-4 h-4" />, description: "Lista numerada" },
    { type: "code" as BlockType, label: "Código", icon: <Code className="w-4 h-4" />, description: "Bloco de código" },
    { type: "quote" as BlockType, label: "Citação", icon: <Quote className="w-4 h-4" />, description: "Citação destacada" },
    { type: "callout" as BlockType, label: "Callout", icon: <AlertCircle className="w-4 h-4" />, description: "Caixa de destaque" },
    { type: "toggle" as BlockType, label: "Toggle", icon: <ChevronDown className="w-4 h-4" />, description: "Lista recolhível" },
    { type: "divider" as BlockType, label: "Divisor", icon: <MoreHorizontal className="w-4 h-4" />, description: "Linha divisória" },
    { type: "table" as BlockType, label: "Tabela", icon: <Table className="w-4 h-4" />, description: "Tabela simples" },
    { type: "image" as BlockType, label: "Imagem", icon: <ImageIcon className="w-4 h-4" />, description: "Inserir imagem" },
  ];

  const filteredCommands = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(slashInput.toLowerCase())
  );

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Digite / para ver comandos..."
          value={slashInput}
          onChange={(e) => {
            setSlashInput(e.target.value);
            if (e.target.value.startsWith("/")) {
              setShowMenu(true);
            } else {
              setShowMenu(false);
            }
          }}
          className="flex-1"
        />
      </div>

      {showMenu && (
        <Card className="absolute top-full mt-2 w-full max-h-96 overflow-y-auto z-50 shadow-xl">
          <CardContent className="p-2">
            {filteredCommands.map((cmd) => (
              <button
                key={cmd.type}
                onClick={() => {
                  onSelectBlock(cmd.type);
                  setSlashInput("");
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-left"
              >
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                  {cmd.icon}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                    {cmd.label}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {cmd.description}
                  </div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Block Component
function BlockComponent({
  block,
  onUpdate,
  onDelete,
  onDuplicate,
  onAddBlock,
  onDragStart,
  onDragOver,
  onDrop,
}: {
  block: Block;
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onAddBlock: (type: BlockType) => void;
  onDragStart: (e: React.DragEvent, blockId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, blockId: string) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isToggleOpen, setIsToggleOpen] = useState(true);
  const [showFormatting, setShowFormatting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyFormatting = (format: string) => {
    if (!textareaRef.current) return;
    
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selectedText = block.content.substring(start, end);
    
    let formattedText = "";
    switch (format) {
      case "bold":
        formattedText = `**${selectedText}**`;
        break;
      case "italic":
        formattedText = `*${selectedText}*`;
        break;
      case "underline":
        formattedText = `__${selectedText}__`;
        break;
      case "code":
        formattedText = `\`${selectedText}\``;
        break;
      case "link":
        formattedText = `[${selectedText}](url)`;
        break;
    }
    
    const newContent = block.content.substring(0, start) + formattedText + block.content.substring(end);
    onUpdate(block.id, newContent);
  };

  if (block.type === "divider") {
    return (
      <div
        className="relative group py-4"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        draggable
        onDragStart={(e) => onDragStart(e, block.id)}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, block.id)}
      >
        <div className="flex items-center gap-2">
          {isHovered && (
            <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
          )}
          <hr className="flex-1 border-gray-300 dark:border-gray-700" />
        </div>
        {isHovered && (
          <BlockActions
            onDelete={() => onDelete(block.id)}
            onDuplicate={() => onDuplicate(block.id)}
          />
        )}
      </div>
    );
  }

  if (block.type === "heading1" || block.type === "heading2" || block.type === "heading3") {
    const sizes = {
      heading1: "text-3xl",
      heading2: "text-2xl",
      heading3: "text-xl",
    };

    return (
      <div
        className="relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        draggable
        onDragStart={(e) => onDragStart(e, block.id)}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, block.id)}
      >
        <div className="flex items-start gap-2">
          {isHovered && (
            <GripVertical className="w-4 h-4 text-gray-400 cursor-grab mt-2" />
          )}
          <input
            type="text"
            value={block.content}
            onChange={(e) => onUpdate(block.id, e.target.value)}
            className={`flex-1 ${sizes[block.type]} font-bold bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 py-2`}
            placeholder="Título"
          />
        </div>
        {isHovered && (
          <BlockActions
            onDelete={() => onDelete(block.id)}
            onDuplicate={() => onDuplicate(block.id)}
          />
        )}
      </div>
    );
  }

  if (block.type === "code") {
    return (
      <div
        className="relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        draggable
        onDragStart={(e) => onDragStart(e, block.id)}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, block.id)}
      >
        <div className="flex items-start gap-2">
          {isHovered && (
            <GripVertical className="w-4 h-4 text-gray-400 cursor-grab mt-2" />
          )}
          <div className="flex-1 bg-gray-900 dark:bg-gray-950 rounded-lg p-4 font-mono text-sm">
            <textarea
              value={block.content}
              onChange={(e) => onUpdate(block.id, e.target.value)}
              className="w-full bg-transparent border-none outline-none text-green-400 placeholder-gray-600 resize-none"
              placeholder="// Digite seu código aqui"
              rows={5}
            />
          </div>
        </div>
        {isHovered && (
          <BlockActions
            onDelete={() => onDelete(block.id)}
            onDuplicate={() => onDuplicate(block.id)}
          />
        )}
      </div>
    );
  }

  if (block.type === "quote") {
    return (
      <div
        className="relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        draggable
        onDragStart={(e) => onDragStart(e, block.id)}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, block.id)}
      >
        <div className="flex items-start gap-2">
          {isHovered && (
            <GripVertical className="w-4 h-4 text-gray-400 cursor-grab mt-2" />
          )}
          <div className="flex-1 border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 dark:bg-blue-950/20">
            <textarea
              value={block.content}
              onChange={(e) => onUpdate(block.id, e.target.value)}
              className="w-full bg-transparent border-none outline-none text-gray-700 dark:text-gray-300 italic placeholder-gray-400 dark:placeholder-gray-600 resize-none"
              placeholder="Citação..."
              rows={2}
            />
          </div>
        </div>
        {isHovered && (
          <BlockActions
            onDelete={() => onDelete(block.id)}
            onDuplicate={() => onDuplicate(block.id)}
          />
        )}
      </div>
    );
  }

  if (block.type === "callout") {
    return (
      <div
        className="relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        draggable
        onDragStart={(e) => onDragStart(e, block.id)}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, block.id)}
      >
        <div className="flex items-start gap-2">
          {isHovered && (
            <GripVertical className="w-4 h-4 text-gray-400 cursor-grab mt-2" />
          )}
          <div className="flex-1 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <textarea
                value={block.content}
                onChange={(e) => onUpdate(block.id, e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 resize-none"
                placeholder="Destaque importante..."
                rows={2}
              />
            </div>
          </div>
        </div>
        {isHovered && (
          <BlockActions
            onDelete={() => onDelete(block.id)}
            onDuplicate={() => onDuplicate(block.id)}
          />
        )}
      </div>
    );
  }

  if (block.type === "toggle") {
    return (
      <div
        className="relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        draggable
        onDragStart={(e) => onDragStart(e, block.id)}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, block.id)}
      >
        <div className="flex items-start gap-2">
          {isHovered && (
            <GripVertical className="w-4 h-4 text-gray-400 cursor-grab mt-2" />
          )}
          <div className="flex-1">
            <button
              onClick={() => setIsToggleOpen(!isToggleOpen)}
              className="flex items-center gap-2 w-full text-left py-1"
            >
              {isToggleOpen ? (
                <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              )}
              <span className="font-medium text-gray-900 dark:text-gray-100">Toggle</span>
            </button>
            {isToggleOpen && (
              <div className="ml-6 mt-2">
                <textarea
                  value={block.content}
                  onChange={(e) => onUpdate(block.id, e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 resize-none"
                  placeholder="Conteúdo oculto..."
                  rows={2}
                />
              </div>
            )}
          </div>
        </div>
        {isHovered && (
          <BlockActions
            onDelete={() => onDelete(block.id)}
            onDuplicate={() => onDuplicate(block.id)}
          />
        )}
      </div>
    );
  }

  if (block.type === "table") {
    let tableData: string[][] = [[" ", " "], [" ", " "]];
    try {
      tableData = JSON.parse(block.content);
    } catch (e) {
      // Keep default
    }

    return (
      <div
        className="relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        draggable
        onDragStart={(e) => onDragStart(e, block.id)}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, block.id)}
      >
        <div className="flex items-start gap-2">
          {isHovered && (
            <GripVertical className="w-4 h-4 text-gray-400 cursor-grab mt-2" />
          )}
          <div className="flex-1 overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
              <tbody>
                {tableData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="border border-gray-300 dark:border-gray-700 p-2">
                        <input
                          type="text"
                          value={cell}
                          onChange={(e) => {
                            const newData = [...tableData];
                            newData[rowIndex][cellIndex] = e.target.value;
                            onUpdate(block.id, JSON.stringify(newData));
                          }}
                          className="w-full bg-transparent border-none outline-none text-gray-900 dark:text-gray-100"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {isHovered && (
          <BlockActions
            onDelete={() => onDelete(block.id)}
            onDuplicate={() => onDuplicate(block.id)}
          />
        )}
      </div>
    );
  }

  if (block.type === "list" || block.type === "numbered") {
    return (
      <div
        className="relative group flex gap-2"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        draggable
        onDragStart={(e) => onDragStart(e, block.id)}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, block.id)}
      >
        {isHovered && (
          <GripVertical className="w-4 h-4 text-gray-400 cursor-grab mt-1" />
        )}
        <span className="text-gray-600 dark:text-gray-400 mt-1">
          {block.type === "list" ? "•" : "1."}
        </span>
        <input
          type="text"
          value={block.content}
          onChange={(e) => onUpdate(block.id, e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 py-1"
          placeholder="Item da lista"
        />
        {isHovered && (
          <BlockActions
            onDelete={() => onDelete(block.id)}
            onDuplicate={() => onDuplicate(block.id)}
          />
        )}
      </div>
    );
  }

  if (block.type === "image") {
    return (
      <div
        className="relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        draggable
        onDragStart={(e) => onDragStart(e, block.id)}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, block.id)}
      >
        <div className="flex items-start gap-2">
          {isHovered && (
            <GripVertical className="w-4 h-4 text-gray-400 cursor-grab mt-2" />
          )}
          <div className="flex-1">
            <input
              type="text"
              value={block.content}
              onChange={(e) => onUpdate(block.id, e.target.value)}
              className="w-full bg-transparent border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600"
              placeholder="Cole a URL da imagem aqui"
            />
            {block.content && block.content.startsWith("http") && (
              <img
                src={block.content}
                alt="Imagem"
                className="mt-2 rounded-lg max-w-full h-auto"
              />
            )}
          </div>
        </div>
        {isHovered && (
          <BlockActions
            onDelete={() => onDelete(block.id)}
            onDuplicate={() => onDuplicate(block.id)}
          />
        )}
      </div>
    );
  }

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      draggable
      onDragStart={(e) => onDragStart(e, block.id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, block.id)}
    >
      <div className="flex items-start gap-2">
        {isHovered && (
          <GripVertical className="w-4 h-4 text-gray-400 cursor-grab mt-1" />
        )}
        <div className="flex-1">
          {isHovered && (
            <div className="flex gap-1 mb-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => applyFormatting("bold")}
              >
                <Bold className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => applyFormatting("italic")}
              >
                <Italic className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => applyFormatting("underline")}
              >
                <Underline className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => applyFormatting("code")}
              >
                <Code className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => applyFormatting("link")}
              >
                <LinkIcon className="w-3 h-3" />
              </Button>
            </div>
          )}
          <textarea
            ref={textareaRef}
            value={block.content}
            onChange={(e) => onUpdate(block.id, e.target.value)}
            className="w-full bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 py-1 resize-none"
            placeholder="Digite algo..."
            rows={1}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = target.scrollHeight + "px";
            }}
          />
        </div>
      </div>
      {isHovered && (
        <BlockActions
          onDelete={() => onDelete(block.id)}
          onDuplicate={() => onDuplicate(block.id)}
        />
      )}
    </div>
  );
}

// Block Actions Component
function BlockActions({
  onDelete,
  onDuplicate,
}: {
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  return (
    <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2">
          <div className="space-y-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={onDuplicate}
            >
              <Copy className="w-4 h-4" />
              Duplicar
            </Button>
            <Separator />
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
              onClick={onDelete}
            >
              <Trash2 className="w-4 h-4" />
              Deletar
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
