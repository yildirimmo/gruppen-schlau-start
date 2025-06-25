import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Users, Filter, Trash2, Edit, Calendar, MapPin, GraduationCap, Mail, Clock } from 'lucide-react';
import { useStudentManagement, type StudentFilters } from '@/hooks/useStudentManagement';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const StudentManagement = () => {
  const [filters, setFilters] = useState<StudentFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  
  const { 
    students, 
    isLoading, 
    deleteStudent, 
    isDeleting,
    getFilterOptions,
    getStats 
  } = useStudentManagement(filters);

  const { bundeslaender, klassenstufen } = getFilterOptions();
  const stats = getStats();

  // Filter students by search term
  const filteredStudents = students.filter(student => {
    const searchLower = searchTerm.toLowerCase();
    return (
      student.first_name.toLowerCase().includes(searchLower) ||
      student.last_name.toLowerCase().includes(searchLower) ||
      student.email.toLowerCase().includes(searchLower) ||
      student.bundesland.toLowerCase().includes(searchLower) ||
      student.klassenstufe.toLowerCase().includes(searchLower)
    );
  });

  const handleDeleteStudent = (studentId: string) => {
    deleteStudent.mutate(studentId);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  const formatAvailabilities = (availabilities: Array<{ day: string; time: string }>) => {
    if (!availabilities || availabilities.length === 0) return 'Keine';
    
    return availabilities.map(av => `${av.day} ${av.time}`).join(', ');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Lade Schülerdaten...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Gesamt</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Mit Verfügbarkeiten</p>
                <p className="text-2xl font-bold">{stats.withAvailabilities}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">In Gruppen</p>
                <p className="text-2xl font-bold">{stats.inGroups}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Verfügbar</p>
                <p className="text-2xl font-bold">{stats.available}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter & Suche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Suche</Label>
              <Input
                id="search"
                placeholder="Name, E-Mail, Bundesland..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="bundesland">Bundesland</Label>
              <Select value={filters.bundesland || ''} onValueChange={(value) => 
                setFilters(prev => ({ ...prev, bundesland: value || undefined }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Alle Bundesländer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Alle Bundesländer</SelectItem>
                  {bundeslaender.map(bl => (
                    <SelectItem key={bl} value={bl}>{bl}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="klassenstufe">Klassenstufe</Label>
              <Select value={filters.klassenstufe || ''} onValueChange={(value) => 
                setFilters(prev => ({ ...prev, klassenstufe: value || undefined }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Alle Klassenstufen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Alle Klassenstufen</SelectItem>
                  {klassenstufen.map(ks => (
                    <SelectItem key={ks} value={ks}>{ks}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="group-status">Gruppenstatus</Label>
              <Select value={filters.inGroup?.toString() || ''} onValueChange={(value) => 
                setFilters(prev => ({ 
                  ...prev, 
                  inGroup: value === '' ? undefined : value === 'true' 
                }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Alle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Alle</SelectItem>
                  <SelectItem value="true">In Gruppe</SelectItem>
                  <SelectItem value="false">Nicht in Gruppe</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mt-4">
            <Button variant="outline" onClick={clearFilters}>
              Filter zurücksetzen
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Schüler ({filteredStudents.length})</CardTitle>
          <CardDescription>
            Übersicht aller registrierten Schüler mit ihren Verfügbarkeiten
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Keine Schüler gefunden</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>E-Mail</TableHead>
                    <TableHead>Bundesland</TableHead>
                    <TableHead>Klassenstufe</TableHead>
                    <TableHead>Registriert</TableHead>
                    <TableHead>Verfügbarkeiten</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.student_id}>
                      <TableCell className="font-medium">
                        {student.first_name} {student.last_name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          {student.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          {student.bundesland}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-gray-400" />
                          {student.klassenstufe}
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(student.registered_at), 'dd.MM.yyyy', { locale: de })}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          {student.availability_count > 0 ? (
                            <div className="space-y-1">
                              <Badge variant="secondary">
                                {student.availability_count} Zeiten
                              </Badge>
                              <p className="text-xs text-gray-600 truncate">
                                {formatAvailabilities(student.availabilities)}
                              </p>
                            </div>
                          ) : (
                            <Badge variant="outline">Keine</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={student.in_group ? "default" : "secondary"}>
                          {student.in_group ? "In Gruppe" : "Verfügbar"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" disabled={isDeleting}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Schüler löschen</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Sind Sie sicher, dass Sie {student.first_name} {student.last_name} löschen möchten? 
                                  Diese Aktion kann nicht rückgängig gemacht werden.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteStudent(student.student_id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Löschen
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentManagement;
