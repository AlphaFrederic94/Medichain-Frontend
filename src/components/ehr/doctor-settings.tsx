'use client';

import { useState, useEffect } from 'react';
import { PageContainer } from '@/components/ehr/page-container';
import { FormSection } from '@/components/ehr/form-section';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User, Shield, Stethoscope, CheckCircle2, Save, Loader2,
} from 'lucide-react';
import { useMyProviderProfile, useUpdateMyProviderProfile, useSpecialties } from '@/lib/hooks/use-provider';
import { useChangePassword } from '@/lib/hooks/use-auth';
import type { Staff } from '@/lib/api';

// ── Profile Tab ─────────────────────────────────────────────────
function ProfileTab() {
  const { data: profile, isLoading } = useMyProviderProfile();
  const { data: specialties } = useSpecialties();
  const { mutate: updateProfile, isPending: saving, isSuccess, error } = useUpdateMyProviderProfile();

  const [form, setForm] = useState<Partial<Staff>>({});
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (profile) setForm(profile);
  }, [profile]);

  const set = (key: keyof Staff, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setDirty(true);
  };

  const saveProfile = () => {
    updateProfile(form, {
      onSuccess: () => setDirty(false),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FormSection title="Personal Information" description="Your professional profile visible to patients and colleagues">
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
            <Label>Phone</Label>
            <Input value={form.phone ?? ''} onChange={(e) => set('phone', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <div className="h-9 rounded-md border border-input bg-muted/50 px-3 flex items-center">
              <Badge variant="secondary" className="text-xs">
                {profile?.role?.replace('_', ' ') ?? '—'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="space-y-2 mt-4">
          <Label>Bio / Professional Summary</Label>
          <Textarea
            rows={3}
            placeholder="Brief professional description…"
            value={form.bio ?? ''}
            onChange={(e) => set('bio', e.target.value)}
          />
        </div>
      </FormSection>

      <FormSection title="Credentials" description="Professional credentials and specialization">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>License Number</Label>
            <Input
              value={form.licenseNo ?? ''}
              onChange={(e) => set('licenseNo', e.target.value)}
              placeholder="e.g., CMR-MED-12345"
            />
          </div>
          <div className="space-y-2">
            <Label>Specialty</Label>
            {specialties && specialties.length > 0 ? (
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                value={form.specialty ?? ''}
                onChange={(e) => set('specialty', e.target.value)}
              >
                <option value="">Select specialty</option>
                {specialties.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            ) : (
              <Input
                value={form.specialty ?? ''}
                onChange={(e) => set('specialty', e.target.value)}
                placeholder="e.g., Cardiology"
              />
            )}
          </div>
        </div>
      </FormSection>

      {/* Verification status */}
      <Card className={profile?.verified ? 'border-emerald-accent/20 bg-emerald-accent/5' : 'border-amber-warm/20 bg-amber-warm/5'}>
        <CardContent className="p-4 flex items-center gap-3">
          <CheckCircle2 className={`size-5 shrink-0 ${profile?.verified ? 'text-emerald-accent' : 'text-amber-warm'}`} />
          <div>
            <p className="text-sm font-semibold">
              {profile?.verified ? 'Account Verified' : 'Verification Pending'}
            </p>
            <p className="text-xs text-muted-foreground">
              {profile?.verified
                ? 'Your credentials have been verified by AfriHealth Chain.'
                : 'Your account is pending verification by a facility administrator.'}
            </p>
          </div>
        </CardContent>
      </Card>

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
        {error && <span className="text-sm text-destructive">{(error as Error).message}</span>}
      </div>
    </div>
  );
}

// ── Security Tab ────────────────────────────────────────────────
function SecurityTab() {
  const { mutate: changePassword, isPending, isSuccess, error } = useChangePassword();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [formError, setFormError] = useState('');

  const handleSubmit = () => {
    if (form.newPassword !== form.confirmPassword) {
      setFormError('Passwords do not match');
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
      <FormSection title="Change Password" description="Update your login credentials">
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

// ── Main Export ─────────────────────────────────────────────────
export function DoctorSettings() {
  return (
    <PageContainer title="Settings" subtitle="Manage your professional profile and account">
      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile" className="gap-2">
            <User className="size-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="size-4" /> Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile"><ProfileTab /></TabsContent>
        <TabsContent value="security"><SecurityTab /></TabsContent>
      </Tabs>
    </PageContainer>
  );
}
