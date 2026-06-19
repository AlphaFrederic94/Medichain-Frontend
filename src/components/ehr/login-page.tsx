'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Key, Globe, Eye, EyeOff, Loader2, ChevronRight, AlertCircle } from 'lucide-react';
import { useLogin, useRegisterPatient, useRegisterProvider } from '@/lib/hooks/use-auth';

export function LoginPage() {
  const loginMutation = useLogin();
  const patientRegisterMutation = useRegisterPatient();
  const providerRegisterMutation = useRegisterProvider();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [accountType, setAccountType] = useState<'patient' | 'provider'>('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [providerRole, setProviderRole] = useState<'DOCTOR' | 'NURSE' | 'PHARMACIST' | 'FACILITY_ADMIN'>('DOCTOR');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [lang, setLang] = useState('en');

  const activeMutation =
    mode === 'login'
      ? loginMutation
      : accountType === 'patient'
        ? patientRegisterMutation
        : providerRegisterMutation;

  const validate = () => {
    const e: Record<string, string> = {};
    if (mode === 'signup') {
      if (!firstName.trim()) e.firstName = 'First name is required';
      if (!lastName.trim()) e.lastName = 'Last name is required';
    }
    if (!email.trim()) e.email = 'Email is required';
    if (!password) e.password = 'Password is required';
    else if (password.length < (mode === 'signup' ? 8 : 6)) {
      e.password = mode === 'signup' ? 'Minimum 8 characters' : 'Minimum 6 characters';
    }
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (mode === 'login') {
      loginMutation.mutate({ email: email.trim(), password });
      return;
    }

    const basePayload = {
      email: email.trim(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      countryCode: 'CMR',
    };

    if (accountType === 'patient') {
      patientRegisterMutation.mutate(basePayload);
    } else {
      providerRegisterMutation.mutate({ ...basePayload, role: providerRole });
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Branding Panel */}
      <div className="relative flex-1 lg:flex-[3] flex flex-col justify-center items-center p-8 lg:p-16 overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-emerald-accent/80">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl" />
        </div>
        <div className="relative z-10 max-w-lg text-primary-foreground">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">AfriHealth Chain</h1>
              <p className="text-sm opacity-80">Electronic Health Records</p>
            </div>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold leading-tight mb-4">
            Your health story.<br />Your chain.<br />
            <span className="opacity-80">Everywhere in Africa.</span>
          </h2>
          <p className="text-base opacity-70 mb-10 leading-relaxed">
            Blockchain-secured health records with patient-controlled consent, built for Africa&apos;s healthcare future.
          </p>
          <div className="space-y-5">
            {[
              { icon: Shield, title: 'Blockchain-Secured Records', desc: 'Every record anchored immutably on-chain' },
              { icon: Key, title: 'Patient-Controlled Consent', desc: 'You decide who sees your data, and for how long' },
              { icon: Globe, title: 'Pan-African Interoperability', desc: 'Seamless access across facilities and borders' },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-4 group">
                <div className="w-10 h-10 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0 group-hover:bg-white/25 transition-colors">
                  <f.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{f.title}</h3>
                  <p className="text-xs opacity-60 mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Login Form */}
      <div className="flex-1 lg:flex-[2] flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === 'login' ? 'Sign in to access your health chain' : 'Register as a patient or healthcare provider'}
            </p>
          </div>

          {/* API error banner */}
          {activeMutation.error && (
            <div className="mb-4 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="size-4 mt-0.5 shrink-0" />
              <span>{activeMutation.error.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        setFieldErrors((p) => ({ ...p, firstName: '' }));
                      }}
                      className={fieldErrors.firstName ? 'border-destructive' : ''}
                      autoComplete="given-name"
                    />
                    {fieldErrors.firstName && <p className="text-xs text-destructive">{fieldErrors.firstName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value);
                        setFieldErrors((p) => ({ ...p, lastName: '' }));
                      }}
                      className={fieldErrors.lastName ? 'border-destructive' : ''}
                      autoComplete="family-name"
                    />
                    {fieldErrors.lastName && <p className="text-xs text-destructive">{fieldErrors.lastName}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Account Type</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={accountType === 'patient' ? 'default' : 'outline'}
                      onClick={() => setAccountType('patient')}
                    >
                      Patient
                    </Button>
                    <Button
                      type="button"
                      variant={accountType === 'provider' ? 'default' : 'outline'}
                      onClick={() => setAccountType('provider')}
                    >
                      Provider
                    </Button>
                  </div>
                </div>

                {accountType === 'provider' && (
                  <div className="space-y-2">
                    <Label htmlFor="providerRole" className="text-sm font-medium">Provider Role</Label>
                    <select
                      id="providerRole"
                      className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                      value={providerRole}
                      onChange={(e) => setProviderRole(e.target.value as typeof providerRole)}
                    >
                      <option value="DOCTOR">Doctor</option>
                      <option value="NURSE">Nurse</option>
                      <option value="PHARMACIST">Pharmacist</option>
                      <option value="FACILITY_ADMIN">Facility Admin</option>
                    </select>
                  </div>
                )}
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFieldErrors((p) => ({ ...p, email: '' }));
                }}
                className={fieldErrors.email ? 'border-destructive' : ''}
                autoComplete="email"
              />
              {fieldErrors.email && <p className="text-xs text-destructive">{fieldErrors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={mode === 'signup' ? 'Create a password' : 'Enter your password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFieldErrors((p) => ({ ...p, password: '' }));
                  }}
                  className={`pr-10 ${fieldErrors.password ? 'border-destructive' : ''}`}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && <p className="text-xs text-destructive">{fieldErrors.password}</p>}
            </div>

            <Button type="submit" className="w-full h-10" disabled={activeMutation.isPending}>
              {activeMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {mode === 'login' ? 'Signing in...' : 'Creating account...'}</>
              ) : (
                <>{mode === 'login' ? 'Sign in' : 'Create account'} <ChevronRight className="w-4 h-4 ml-1" /></>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-center text-xs text-muted-foreground mb-3">
              {mode === 'login' ? 'New to AfriHealth Chain?' : 'Already have an account?'}
            </p>
            <Button
              type="button"
              variant="outline"
              className="w-full h-9 text-xs"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setFieldErrors({});
              }}
            >
              {mode === 'login' ? 'Register your account' : 'Back to sign in'}
            </Button>
          </div>

          {/* Language selector */}
          <div className="mt-6 flex items-center justify-center gap-1">
            {[
              { code: 'en', label: 'English' },
              { code: 'fr', label: 'Français' },
              { code: 'sw', label: 'Swahili' },
            ].map((l, i) => (
              <span key={l.code} className="flex items-center">
                <button
                  type="button"
                  onClick={() => setLang(l.code)}
                  className={`text-xs px-2 py-1 rounded transition-colors ${
                    lang === l.code
                      ? 'text-primary font-medium bg-primary/5'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {l.label}
                </button>
                {i < 2 && <span className="text-muted-foreground/40 mx-1">·</span>}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
