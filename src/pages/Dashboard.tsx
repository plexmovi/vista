import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useChannels } from '../contexts/ChannelContext';
import { Channel, ChannelCreate } from '../types';
import { HLSPlayer } from '../components/HLSPlayer';
import {
  Tv,
  Plus,
  Trash2,
  Play,
  RefreshCw,
  CheckCircle,
  XCircle,
  Loader2,
  LogOut,
  X,
  ExternalLink,
  Clock
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export function DashboardPage() {
  const { logout, pin } = useAuth();
  const { channels, addChannel, removeChannel, verifyChannel, verifyAllChannels, selectedChannel, setSelectedChannel, isLoading } = useChannels();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [channelToDelete, setChannelToDelete] = useState<Channel | null>(null);

  const [newChannel, setNewChannel] = useState<ChannelCreate>({
    name: '',
    url: ''
  });
  const [formError, setFormError] = useState('');

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      verifyAllChannels();
    }, 30000);

    return () => clearInterval(interval);
  }, [verifyAllChannels]);

  // Abrir reproductor
  const handlePlay = (channel: Channel) => {
    setSelectedChannel(channel);
    setIsPlayerOpen(true);
  };

  // Agregar canal
  const handleAddChannel = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!newChannel.name.trim()) {
      setFormError('El nombre del canal es requerido');
      return;
    }

    if (!newChannel.url.trim()) {
      setFormError('La URL del stream es requerida');
      return;
    }

    // Validar que sea una URL m3u8
    const urlPattern = /^https?:\/\/.+\.(m3u8|m3u)(\?.*)?$/i;
    if (!urlPattern.test(newChannel.url) && !newChannel.url.includes('.m3u8')) {
      // Permitir cualquier URL pero mostrar warning
      console.warn('La URL podría no ser un stream m3u8 válido');
    }

    addChannel(newChannel);
    setNewChannel({ name: '', url: '' });
    setIsAddModalOpen(false);
  };

  // Confirmar eliminación
  const handleDeleteClick = (channel: Channel, e: React.MouseEvent) => {
    e.stopPropagation();
    setChannelToDelete(channel);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (channelToDelete) {
      removeChannel(channelToDelete.id);
    }
    setIsDeleteDialogOpen(false);
    setChannelToDelete(null);
  };

  // Obtener icono de estado
  const getStatusIcon = (status: Channel['status']) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'offline':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'checking':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-slate-500" />;
    }
  };

  // Formatear tiempo
  const formatLastChecked = (date?: Date) => {
    if (!date) return 'Nunca';
    const now = new Date();
    const diff = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

    if (diff < 60) return 'Hace un momento';
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
    return `Hace ${Math.floor(diff / 3600)} h`;
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-lg border-b border-slate-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Tv className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">StreamCheck</h1>
                <p className="text-xs text-slate-400">Monitoreo en tiempo real</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={verifyAllChannels}
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Verificar todo
              </Button>

              <Button
                onClick={() => setIsAddModalOpen(true)}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Canal
              </Button>

              <Button
                onClick={logout}
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white hover:bg-slate-700"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <p className="text-slate-400 text-sm">Total Canales</p>
            <p className="text-2xl font-bold text-white">{channels.length}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <p className="text-slate-400 text-sm">En Línea</p>
            <p className="text-2xl font-bold text-green-500">
              {channels.filter(c => c.status === 'online').length}
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <p className="text-slate-400 text-sm">Desconectados</p>
            <p className="text-2xl font-bold text-red-500">
              {channels.filter(c => c.status === 'offline').length}
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <p className="text-slate-400 text-sm">Verificando</p>
            <p className="text-2xl font-bold text-blue-500">
              {channels.filter(c => c.status === 'checking').length}
            </p>
          </div>
        </div>

        {/* Channels Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : channels.length === 0 ? (
          <div className="text-center py-16 bg-slate-800/30 rounded-2xl border-2 border-dashed border-slate-700">
            <Tv className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-300 mb-2">
              No hay canales registrados
            </h3>
            <p className="text-slate-500 mb-6">
              Agrega tu primer canal para comenzar a monitorear
            </p>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Canal
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {channels.map((channel) => (
              <div
                key={channel.id}
                className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 hover:border-slate-600 transition-all"
              >
                {/* Channel Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white truncate">
                      {channel.name}
                    </h3>
                    <p className="text-sm text-slate-400 truncate flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" />
                      {channel.url}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    {getStatusIcon(channel.status)}
                  </div>
                </div>

                {/* Status Info */}
                <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatLastChecked(channel.lastChecked)}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handlePlay(channel)}
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={channel.status === 'offline'}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Reproducir
                  </Button>
                  <Button
                    onClick={(e) => handleDeleteClick(channel, e)}
                    variant="outline"
                    size="sm"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add Channel Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Canal</DialogTitle>
            <DialogDescription className="text-slate-400">
              Ingresa los datos del canal de streaming
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddChannel}>
            <div className="space-y-4 py-4">
              {formError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-sm">{formError}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-300">
                  Nombre del Canal
                </Label>
                <Input
                  id="name"
                  placeholder="Ej: Canal Premium"
                  value={newChannel.name}
                  onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="url" className="text-slate-300">
                  URL del Stream (.m3u8)
                </Label>
                <Input
                  id="url"
                  placeholder="https://ejemplo.com/stream.m3u8"
                  value={newChannel.url}
                  onChange={(e) => setNewChannel({ ...newChannel, url: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Canal
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Player Modal */}
      <Dialog open={isPlayerOpen} onOpenChange={setIsPlayerOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Play className="w-5 h-5 text-green-500" />
              {selectedChannel?.name}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {selectedChannel?.url}
            </DialogDescription>
          </DialogHeader>

          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            {selectedChannel && (
              <HLSPlayer
                src={selectedChannel.url}
                onError={(error) => console.error('Player error:', error)}
              />
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPlayerOpen(false)}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <X className="w-4 h-4 mr-2" />
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Eliminar Canal</DialogTitle>
            <DialogDescription className="text-slate-400">
              ¿Estás seguro de que deseas eliminar "{channelToDelete?.name}"?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
