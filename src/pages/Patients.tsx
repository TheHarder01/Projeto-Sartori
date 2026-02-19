import { useMemo, useState } from 'react';
import { useClinic } from '@/contexts/ClinicContext';
import { Patient, TREATMENTS } from '@/types/clinic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Edit, Trash2, Eye, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

const emptyForm = {
  name: '',
  phone: '',
  cpf: '',
  birthDate: '',
  treatmentSelection: TREATMENTS[0],
  treatmentCustom: '',
  treatmentMode: 'list' as 'list' | 'custom',
};

const sanitizeUpperName = (value: string) => value.toUpperCase().replace(/[^A-ZÀ-Ú\s]/g, '');
const sanitizeUpperText = (value: string) => value.toUpperCase();
const sanitizePhone = (value: string) => value.replace(/[^0-9()\-\s]/g, '');

const Patients = () => {
  const { patients, addPatient, updatePatient, deletePatient, referrals, loading } = useClinic();
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = useMemo(() => patients.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.notes.toLowerCase().includes(search.toLowerCase())), [patients, search]);

  const getTreatmentValue = () => (form.treatmentMode === 'list' ? form.treatmentSelection : form.treatmentCustom.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Nome é obrigatório'); return; }
    try {
      if (editingId) {
        await updatePatient(editingId, form);
        toast.success('Paciente atualizado!');
      } else {
        await addPatient(form);
        toast.success('Paciente cadastrado!');
      }
      setForm(emptyForm);
      setEditingId(null);
      setFormOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar paciente');
    }
  };

  const openEdit = (p: Patient) => {
    const matchedTreatment = TREATMENTS.find((t) => t === p.notes);

    setForm({
      name: p.name,
      phone: p.phone,
      cpf: p.cpf,
      birthDate: p.birthDate,
      treatmentSelection: matchedTreatment ?? TREATMENTS[0],
      treatmentCustom: matchedTreatment ? '' : p.notes,
      treatmentMode: matchedTreatment ? 'list' : 'custom',
    });
    setEditingId(p.id);
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePatient(id);
      toast.success('Paciente removido!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao remover paciente');
    }
  };

  const openDetail = (p: Patient) => {
    setSelectedPatient(p);
    setDetailOpen(true);
  };

  const patientReferrals = (id: string) => referrals.filter((r) => r.referrerId === id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cadastro de Pacientes ✨</h1>
          <p className="text-muted-foreground mt-1">{patients.length} pacientes cadastrados</p>
        </div>
        <Dialog
          open={formOpen}
          onOpenChange={(open) => {
            setFormOpen(open);
            if (!open) {
              setForm(emptyForm);
              setEditingId(null);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2 rounded-full px-6 shadow-md">
              <UserPlus className="w-5 h-5" /> Novo Paciente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar Paciente' : 'Novo Paciente'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Nome do Paciente <span className="text-red-500">*</span></Label>
                  <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: sanitizeUpperName(e.target.value) }))} placeholder="EX: JOÃO SILVA" />
                </div>
                <div>
                  <Label>Telefone <span className="text-red-500">*</span></Label>
                  <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: sanitizePhone(e.target.value) }))} placeholder="(11) 98765-4321" />
                </div>
                <div>
                  <Label>CPF</Label>
                  <Input value={form.cpf} onChange={(e) => setForm((f) => ({ ...f, cpf: e.target.value }))} />
                </div>
                <div>
                  <Label>Data de Nascimento</Label>
                  <Input type="date" value={form.birthDate} onChange={(e) => setForm((f) => ({ ...f, birthDate: e.target.value }))} />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Tratamento em Realização <span className="text-red-500">*</span></Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    type="button"
                    className={form.treatmentMode === 'list' ? '' : 'bg-muted text-muted-foreground hover:bg-muted'}
                    onClick={() => setForm((f) => ({ ...f, treatmentMode: 'list' }))}
                  >
                    Selecionar da lista
                  </Button>
                  <Button
                    type="button"
                    className={form.treatmentMode === 'custom' ? '' : 'bg-muted text-muted-foreground hover:bg-muted'}
                    onClick={() => setForm((f) => ({ ...f, treatmentMode: 'custom' }))}
                  >
                    Escrever personalizado
                  </Button>
                </div>

                {form.treatmentMode === 'list' ? (
                  <Select value={form.treatmentSelection} onValueChange={(value) => setForm((f) => ({ ...f, treatmentSelection: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um tratamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {TREATMENTS.map((treatment) => (
                        <SelectItem key={treatment} value={treatment}>
                          {treatment}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input value={form.treatmentCustom} onChange={(e) => setForm((f) => ({ ...f, treatmentCustom: sanitizeUpperText(e.target.value) }))} placeholder="DIGITE O TRATAMENTO" />
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancelar</Button>
                <Button type="submit">{editingId ? 'Salvar' : 'Cadastrar'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-2xl mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou tratamento..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-12 py-6 text-base rounded-xl bg-card shadow-sm border-border"
        />
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted-foreground">Carregando pacientes...</div>
      ) : (
      <>
      {/* Card Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <UserPlus className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p className="text-lg">Nenhum paciente encontrado</p>
          <p className="text-sm mt-1">Clique em "Novo Paciente" para cadastrar</p>
        </div>
      ) : (
        <>
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <UserPlus className="w-12 h-12 mx-auto mb-4 opacity-40" />
              <p className="text-lg">Nenhum paciente encontrado</p>
              <p className="text-sm mt-1">Clique em "Novo Paciente" para cadastrar</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((p, index) => (
                <div key={p.id} className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-md transition-shadow">
                  <div className="gradient-primary px-5 py-4">
                    <p className="text-primary-foreground/80 text-sm font-bold">#{index + 1}</p>
                    <h3 className="text-primary-foreground font-bold text-lg truncate uppercase">{p.name}</h3>
                  </div>

                  <div className="p-5">
                    <div className="bg-muted/50 rounded-lg px-4 py-3 mb-4">
                      <p className="text-xs font-semibold text-primary uppercase tracking-wide">Tratamento</p>
                      <p className="text-sm text-foreground font-medium mt-0.5">{p.notes || '-'}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 rounded-lg border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground" onClick={() => openDetail(p)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 rounded-lg border-info/30 text-info hover:bg-info hover:text-info-foreground" onClick={() => openEdit(p)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 rounded-lg border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={() => handleDelete(p.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      </>
      )}

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes do Paciente</DialogTitle>
          </DialogHeader>
          {selectedPatient && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Nome:</span><p className="font-medium">{selectedPatient.name}</p></div>
                <div><span className="text-muted-foreground">Telefone:</span><p className="font-medium">{selectedPatient.phone || '-'}</p></div>
                <div><span className="text-muted-foreground">CPF:</span><p className="font-medium">{selectedPatient.cpf || '-'}</p></div>
                <div><span className="text-muted-foreground">Nascimento:</span><p className="font-medium">{selectedPatient.birthDate || '-'}</p></div>
                <div className="col-span-2"><span className="text-muted-foreground">Tratamento:</span><p className="font-medium">{selectedPatient.notes || '-'}</p></div>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">Indicações feitas ({patientReferrals(selectedPatient.id).length})</h4>
                {patientReferrals(selectedPatient.id).length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma indicação</p>
                ) : (
                  <div className="space-y-2">
                    {patientReferrals(selectedPatient.id).map((r) => (
                      <div key={r.id} className="flex items-center justify-between p-2 bg-muted rounded-lg text-sm">
                        <span>{r.referredName}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            r.status === 'fechado' ? 'bg-success/20 text-success' : r.status === 'atendido' ? 'bg-warning/20 text-warning' : 'bg-info/20 text-info'
                          }`}
                        >
                          {r.status === 'fechado' ? 'Fechado' : r.status === 'atendido' ? 'Atendido' : 'Indicado'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Patients;
