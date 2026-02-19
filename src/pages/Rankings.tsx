import { useState } from 'react';
import { useScores } from '@/hooks/useScores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Trophy, Medal, Award } from 'lucide-react';

const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const Rankings = () => {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const monthlyScores = useScores(selectedMonth, selectedYear);
  const totalScores = useScores();

  const top10Monthly = monthlyScores.slice(0, 10);
  const top10Total = totalScores.slice(0, 10);

  const chartColors = [
    'hsl(174 62% 38%)', 'hsl(174 62% 44%)', 'hsl(174 62% 50%)', 'hsl(174 50% 55%)',
    'hsl(174 40% 60%)', 'hsl(174 30% 65%)', 'hsl(200 40% 55%)', 'hsl(200 35% 60%)',
    'hsl(200 30% 65%)', 'hsl(200 25% 70%)',
  ];

  const getRankIcon = (i: number) => {
    if (i === 0) return <Trophy className="w-5 h-5 text-warning" />;
    if (i === 1) return <Medal className="w-5 h-5 text-muted-foreground" />;
    if (i === 2) return <Award className="w-5 h-5 text-warning/70" />;
    return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">{i + 1}</span>;
  };

  const ScoreTable = ({ data }: { data: typeof totalScores }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">#</TableHead>
          <TableHead>Paciente</TableHead>
          <TableHead className="text-center">Indicações</TableHead>
          <TableHead className="text-center hidden sm:table-cell">Atendidos</TableHead>
          <TableHead className="text-center hidden sm:table-cell">Fechados</TableHead>
          <TableHead className="text-center font-bold">Pontos</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhum dado disponível</TableCell></TableRow>
        ) : data.map((s, i) => (
          <TableRow key={s.patientId}>
            <TableCell>{getRankIcon(i)}</TableCell>
            <TableCell className="font-medium">{s.patientName}</TableCell>
            <TableCell className="text-center">{s.totalReferrals}</TableCell>
            <TableCell className="text-center hidden sm:table-cell">{s.attended}</TableCell>
            <TableCell className="text-center hidden sm:table-cell">{s.converted}</TableCell>
            <TableCell className="text-center font-bold text-primary">{s.points}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Ranking de Indicadores</h1>
        <p className="text-muted-foreground mt-1">Pontuação: +1 por atendido, +31 por fechado</p>
      </div>

      <Tabs defaultValue="monthly">
        <TabsList>
          <TabsTrigger value="monthly">Ranking Mensal</TabsTrigger>
          <TabsTrigger value="total">Ranking Total</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="space-y-6 mt-4">
          <div className="flex gap-3">
            <Select value={String(selectedMonth)} onValueChange={v => setSelectedMonth(Number(v))}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                {months.map((m, i) => <SelectItem key={i} value={String(i)}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={String(selectedYear)} onValueChange={v => setSelectedYear(Number(v))}>
              <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[2024, 2025, 2026].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <Card className="border-border">
            <CardHeader><CardTitle className="text-lg">Top 10 — {months[selectedMonth]} {selectedYear}</CardTitle></CardHeader>
            <CardContent>
              {top10Monthly.length > 0 && (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={top10Monthly}>
                    <XAxis dataKey="patientName" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="points" radius={[6, 6, 0, 0]} name="Pontos">
                      {top10Monthly.map((_, i) => <Cell key={i} fill={chartColors[i]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-0"><ScoreTable data={monthlyScores} /></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="total" className="space-y-6 mt-4">
          <Card className="border-border">
            <CardHeader><CardTitle className="text-lg">Top 10 — Todos os Tempos</CardTitle></CardHeader>
            <CardContent>
              {top10Total.length > 0 && (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={top10Total}>
                    <XAxis dataKey="patientName" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="points" radius={[6, 6, 0, 0]} name="Pontos">
                      {top10Total.map((_, i) => <Cell key={i} fill={chartColors[i]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-0"><ScoreTable data={totalScores} /></CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Rankings;
