'use client';

import { useState, useEffect } from 'react';
import { PageContainer } from '@/components/ehr/page-container';
import { FormSection } from '@/components/ehr/form-section';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User, Shield, AlertTriangle, Phone, Save, Plus, Trash2, Loader2, CheckCircle2,
} from 'lucide-react';
import {
  useMyPatientProfile,
  useMyAllergies,
  useMyEmergencyContacts,
  useUpdateMyProfile,
  useUpdateAllergies,
  useAddEmergencyContact,
  useDeleteEmergencyContact,
} from '@/lib/hooks/use-patient';
import { useChangePassword } from '@/lib/hooks/use-auth';
import type { PatientProfile, Allergy } from '@/lib/api';

// ── Profile Tab ────────────────────────────────────────────────────────────
function ProfileTab() {
  const { data: profile, isLoading } = useMyPatientProfile();
  const { mutate: updateProfile, isPending: saving, isSuccess, error } = useUpdateMyProfile();
  const [form, setForm] = useState<Partial<PatientProfile>>({});
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (profile) setForm(profile);
  }, [profile]);

  const set = (key: keyof PatientProfile, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setDirty(true);
  };

  const saveProfile = () => {
    const payload: Partial<PatientProfile> = {
      firstName: form.firstName?.trim(),
      lastName: form.lastName?.trim(),
      dateOfBirth: form.dateOfBirth || undefined,
      gender: form.gender || undefined,
      phone: form.phone?.trim() || undefined,
      nationalId: form.nationalId?.trim() || undefined,
      bloodGroup: form.bloodGroup || undefined,
      address: form.address?.trim() || undefined,
      city: form.city?.trim() || undefined,
      languagePref: form.languagePref || undefined,
    };

    updateProfile(payload, {
      onSuccess: () => setDirty(false),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FormSection title="Personal Information" description="Basic profile details linked to your DID">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>First Name</Label>
            <Input value={form.firstName ?? ''} onChange={(e) => set('firstName', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Last Name</Label>
            <Input value={form.lastName ?? ''} onChange={(e) => set('lastName', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Date of Birth</Label>
            <Input type="date" value={form.dateOfBirth?.slice(0, 10) ?? ''} onChange={(e) => set('dateOfBirth', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Gender</Label>
            <select
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={form.gender ?? ''}
              onChange={(e) => set('gender', e.target.value)}
            >
              <option value="">Select gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={form.phone ?? ''} onChange={(e) => set('phone', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={form.email ?? ''} disabled />
          </div>
          <div className="space-y-2">
            <Label>Blood Group</Label>
            <select
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={form.bloodGroup ?? ''}
              onChange={(e) => set('bloodGroup', e.target.value)}
            >
              <option value="">Select blood group</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>National ID</Label>
            <Input value={form.nationalId ?? ''} onChange={(e) => set('nationalId', e.target.value)} />
          </div>
        </div>
      </FormSection>

      <FormSection title="Location" description="Address and city information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2 sm:col-span-2">
            <Label>Address</Label>
            <Input value={form.address ?? ''} onChange={(e) => set('address', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>City</Label>
            <Input value={form.city ?? ''} onChange={(e) => set('city', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Language Preference</Label>
            <select
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={form.languagePref ?? 'en'}
              onChange={(e) => set('languagePref', e.target.value)}
            >
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="sw">Swahili</option>
              <option value="ha">Hausa</option>
              <option value="yo">Yoruba</option>
              <option value="ig">Igbo</option>
              <option value="am">Amharic</option>
            </select>
          </div>
        </div>
      </FormSection>

      <div className="flex items-center gap-3">
        <Button
          disabled={!dirty || saving}
          onClick={saveProfile}
          className="gap-2"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Save Changes
        </Button>
        {isSuccess && (
          <span className="text-sm text-emerald-accent flex items-center gap-1">
            <CheckCircle2 className="size-4" /> Saved successfully
          </span>
        )}
        {error && <span className="text-sm text-destructive">{error.message}</span>}
      </div>
    </div>
  );
}

// ── Allergies Tab ──────────────────────────────────────────────────────────
function AllergiesTab() {
  const { data: allergies, isLoading } = useMyAllergies();
  const { mutate: updateAllergies, isPending } = useUpdateAllergies();
  const [list, setList] = useState<Array<{ substance: string; reaction: string; severity: string }>>([]);
  const [newSubstance, setNewSubstance] = useState('');
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (allergies) {
      setList(allergies.map((a) => ({ substance: a.substance, reaction: a.reaction ?? '', severity: a.severity })));
    }
  }, [allergies]);

  const addAllergy = () => {
    if (!newSubstance.trim()) return;
    setList((prev) => [...prev, { substance: newSubstance.trim(), reaction: '', severity: 'MILD' }]);
    setNewSubstance('');
    setDirty(true);
  };

  const removeAllergy = (idx: number) => {
    setList((prev) => prev.filter((_, i) => i !== idx));
    setDirty(true);
  };

  if (isLoading) return <Skeleton className="h-48 rounded-xl" />;

  return (
    <div className="space-y-6">
      <FormSection title="Known Allergies" description="List of substances you are allergic to">
        <div className="space-y-3">
          {list.map((a, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
              <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="size-4 text-destructive" />
              </div>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Input
                  value={a.substance}
                  onChange={(e) => {
                    const updated = [...list];
                    updated[idx].substance = e.target.value;
                    setList(updated);
                    setDirty(true);
                  }}
                  placeholder="Substance"
                  className="h-8 text-sm"
                />
                <Input
                  value={a.reaction}
                  onChange={(e) => {
                    const updated = [...list];
                    updated[idx].reaction = e.target.value;
                    setList(updated);
                    setDirty(true);
                  }}
                  placeholder="Reaction"
                  className="h-8 text-sm"
                />
                <select
                  value={a.severity}
                  onChange={(e) => {
                    const updated = [...list];
                    updated[idx].severity = e.target.value;
                    setList(updated);
                    setDirty(true);
                  }}
                  className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                >
                  <option value="MILD">Mild</option>
                  <option value="MODERATE">Moderate</option>
                  <option value="SEVERE">Severe</option>
                  <option value="LIFE_THREATENING">Life-Threatening</option>
                </select>
              </div>
              <button onClick={() => removeAllergy(idx)} className="text-muted-foreground hover:text-destructive shrink-0">
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-3">
          <Input
            placeholder="Add new allergy substance…"
            value={newSubstance}
            onChange={(e) => setNewSubstance(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addAllergy()}
          />
          <Button variant="outline" onClick={addAllergy} className="gap-1 shrink-0">
            <Plus className="size-4" /> Add
          </Button>
        </div>
      </FormSection>

      <Button
        disabled={!dirty || isPending}
        onClick={() => { updateAllergies(list); setDirty(false); }}
        className="gap-2"
      >
        {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
        Save Allergies
      </Button>
    </div>
  );
}

// ── Emergency Contacts Tab ─────────────────────────────────────────────────
function EmergencyTab() {
  const { data: contacts, isLoading } = useMyEmergencyContacts();
  const { mutate: addContact, isPending: adding } = useAddEmergencyContact();
  const { mutate: deleteContact } = useDeleteEmergencyContact();
  const [form, setForm] = useState({ name: '', phone: '', relationship: '' });

  if (isLoading) return <Skeleton className="h-48 rounded-xl" />;

  return (
    <div className="space-y-6">
      <FormSection title="Emergency Contacts" description="People to contact in case of emergency">
        <div className="space-y-3">
          {(contacts ?? []).map((c) => (
            <div key={c.id} className="flex items-center gap-3 p-4 rounded-lg border bg-card">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                {c.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{c.name}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Phone className="size-3" /> {c.phone}
                  </span>
                  {c.relationship && (
                    <Badge variant="outline" className="text-xs">{c.relationship}</Badge>
                  )}
                </div>
              </div>
              <button
                onClick={() => deleteContact(c.id)}
                className="text-muted-foreground hover:text-destructive shrink-0"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>

        <Separator className="my-4" />

        <div className="space-y-3">
          <p className="text-sm font-medium">Add New Contact</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Full Name</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Jane Doe" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+237 6XX XXX XXX" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Relationship</Label>
              <Input value={form.relationship} onChange={(e) => setForm((f) => ({ ...f, relationship: e.target.value }))} placeholder="Spouse, Parent…" />
            </div>
          </div>
          <Button
            disabled={!form.name || !form.phone || adding}
            onClick={() => { addContact(form); setForm({ name: '', phone: '', relationship: '' }); }}
            className="gap-2"
          >
            {adding ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            Add Contact
          </Button>
        </div>
      </FormSection>
    </div>
  );
}

// ── Security Tab ───────────────────────────────────────────────────────────
function SecurityTab() {
  const { mutate: changePassword, isPending, isSuccess, error } = useChangePassword();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [formError, setFormError] = useState('');

  const handleSubmit = () => {
    if (form.newPassword !== form.confirmPassword) {
      setFormError('New passwords do not match');
      return;
    }
    if (form.newPassword.length < 8) {
      setFormError('New password must be at least 8 characters');
      return;
    }
    setFormError('');
    changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
  };

  return (
    <div className="space-y-6">
      <FormSection title="Change Password" description="Update your account password">
        <div className="space-y-4 max-w-sm">
          <div className="space-y-2">
            <Label>Current Password</Label>
            <Input
              type="password"
              value={form.currentPassword}
              onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>New Password</Label>
            <Input
              type="password"
              value={form.newPassword}
              onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Confirm New Password</Label>
            <Input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
            />
          </div>

          {(formError || error) && (
            <p className="text-xs text-destructive">{formError || (error as Error)?.message}</p>
          )}
          {isSuccess && (
            <p className="text-xs text-emerald-accent flex items-center gap-1">
              <CheckCircle2 className="size-3.5" /> Password changed successfully
            </p>
          )}

          <Button
            disabled={isPending || !form.currentPassword || !form.newPassword}
            onClick={handleSubmit}
            className="gap-2"
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <Shield className="size-4" />}
            Update Password
          </Button>
        </div>
      </FormSection>
    </div>
  );
}

// ── Main Export ────────────────────────────────────────────────────────────
export function PatientSettings() {
  return (
    <PageContainer title="Settings" subtitle="Manage your profile and account preferences">
      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile" className="gap-2">
            <User className="size-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="allergies" className="gap-2">
            <AlertTriangle className="size-4" /> Allergies
          </TabsTrigger>
          <TabsTrigger value="emergency" className="gap-2">
            <Phone className="size-4" /> Emergency Contacts
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="size-4" /> Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile"><ProfileTab /></TabsContent>
        <TabsContent value="allergies"><AllergiesTab /></TabsContent>
        <TabsContent value="emergency"><EmergencyTab /></TabsContent>
        <TabsContent value="security"><SecurityTab /></TabsContent>
      </Tabs>
    </PageContainer>
  );
}
