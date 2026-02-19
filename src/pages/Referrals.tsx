import { useState } from 'react';
import { useClinic } from '@/contexts/ClinicContext';
import { TREATMENTS, ReferralStatus } from '@/types/clinic';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const statusLabels: Record<ReferralStatus, string> = { indicado: 'Indicado', atendido: 'Atendido', fechado: 'Fechado' };
const statusColors: Record<ReferralStatus, string> = {
  indicado: 'bg-info/20 text-info border-info/30',
  atendido: 'bg-warning/20 text-warning border-warning/30',
  fechado: 'bg-success/20 text-success border-success/30',
};

const Referrals = () => {
  const { patients, referrals, addReferral, updateReferralStatus, deleteReferral } = useClinic();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ referrerId: '', referredName: '', referredPhone: '', referredEmail: '', treatmentInterest: '', notes: '' });

  const filtered = referrals.filter(r => {
    const matchSearch = r.referredName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.referrerId || !form.referredName.trim()) { toast.error('Indicador e nome do indicado são obrigatórios'); return; }
    addReferral({ ...form, status: 'indicado' });
    toast.success('Indicação registrada!');
    setForm({ referrerId: '', referredName: '', referredPhone: '', referredEmail: '', treatmentInterest: '', notes: '' });
    setFormOpen(false);
  };

  const getPatientName = (id: string) => patients.find(p => p.id === id)?.name ?? 'Desconhecido';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Indicações</h1>
          <p className="text-muted-foreground mt-1">{referrals.length} indicações registradas</p>
        </div>
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Nova Indicação</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Nova Indicação</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Paciente Indicador *</Label>
                <Select value={form.referrerId} onValueChange={v => setForm(f => ({ ...f, referrerId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione o indicador" /></SelectTrigger>
                  <SelectContent>
                    {patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label>Nome do Indicado *</Label><Input value={form.referredName} onChange={e => setForm(f => ({ ...f, referredName: e.target.value }))} /></div>
                <div><Label>Telefone</Label><Input value={form.referredPhone} onChange={e => setForm(f => ({ ...f, referredPhone: e.target.value }))} /></div>
                <div><Label>Email</Label><Input value={form.referredEmail} onChange={e => setForm(f => ({ ...f, referredEmail: e.target.value }))} /></div>
                <div>
                  <Label>Tratamento de Interesse</Label>
                  <Select value={form.treatmentInterest} onValueChange={v => setForm(f => ({ ...f, treatmentInterest: v }))}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {TREATMENTS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Observações</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancelar</Button>
                <Button type="submit">Registrar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar indicado..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="indicado">Indicado</SelectItem>
            <SelectItem value="atendido">Atendido</SelectItem>
            <SelectItem value="fechado">Fechado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Indicado</TableHead>
                <TableHead className="hidden sm:table-cell">Indicador</TableHead>
                <TableHead className="hidden md:table-cell">Tratamento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhuma indicação encontrada</TableCell></TableRow>
              ) : filtered.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.referredName}</TableCell>
                  <TableCell className="hidden sm:table-cell">{getPatientName(r.referrerId)}</TableCell>
                  <TableCell className="hidden md:table-cell">{r.treatmentInterest || '-'}</TableCell>
                  <TableCell>
                    <Select value={r.status} onValueChange={(v) => { updateReferralStatus(r.id, v as ReferralStatus); toast.success('Status atualizado!'); }}>
                      <SelectTrigger className="w-32 h-8">
                        <Badge variant="outline" className={`${statusColors[r.status]} border`}>{statusLabels[r.status]}</Badge>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="indicado">Indicado</SelectItem>
                        <SelectItem value="atendido">Atendido</SelectItem>
                        <SelectItem value="fechado">Fechado</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => { deleteReferral(r.id); toast.success('Indicação removida!'); }} className="text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Referrals;
