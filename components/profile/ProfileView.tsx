"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Camera,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Loader2,
  Mail,
  Save,
  ShieldUser,
  Trash2,
  User,
  UserCircle2,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/custom-toast-with-icons"
import { ApiRequestError } from "@/lib/api"
import { useProfile, useProfileActions } from "@/features/profile"
import { useAuthActions } from "@/src/features/auth/hooks/useAuthActions"
import { getRoleConfig } from "@/src/components/layout/UserProfile/roleConfig"

function getInitials(name?: string) {
  if (!name) return "U"
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return parts.slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "U"
}

export function ProfileView() {
  const router = useRouter()
  const { profile, isLoading } = useProfile()
  const { updateProfile, changePassword, uploadAvatar, deleteAvatar } = useProfileActions()
  const { logout } = useAuthActions()

  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [currentPassword, setCurrentPassword] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)

  const [updating, setUpdating] = React.useState(false)
  const [changingPassword, setChangingPassword] = React.useState(false)
  const [uploadingAvatar, setUploadingAvatar] = React.useState(false)
  const [deletingAvatar, setDeletingAvatar] = React.useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false)
  const [showNewPassword, setShowNewPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)
  const roleLabel = getRoleConfig(profile?.role).label
  const initializedProfileRef = React.useRef<number | null>(null)

  React.useEffect(() => {
    if (!profile) return
    // Initialize form values once per user to avoid overwriting user typing on revalidation.
    if (initializedProfileRef.current !== profile.id) {
      initializedProfileRef.current = profile.id
      setName(profile.name ?? "")
      setEmail(profile.email ?? "")
    }
  }, [profile])

  React.useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null)
      return
    }
    const next = URL.createObjectURL(selectedFile)
    setPreviewUrl(next)
    return () => URL.revokeObjectURL(next)
  }, [selectedFile])

  async function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setUpdating(true)
    try {
      await updateProfile({
        name: name.trim(),
        email: email.trim() || undefined,
      })
    } finally {
      setUpdating(false)
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error("تأكيد كلمة المرور غير مطابق")
      return
    }
    setChangingPassword(true)
    try {
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      // Backend invalidates tokens after password change; this clears cookie and forces re-auth.
      await logout()
      router.replace("/login")
    } catch (error) {
      if (error instanceof ApiRequestError) {
        toast.error(error.message || "تعذر تحديث كلمة المرور")
      } else {
        toast.error("حدث خطأ غير متوقع أثناء تحديث كلمة المرور")
      }
    } finally {
      setChangingPassword(false)
    }
  }

  async function handleCopyPassword(value: string) {
    if (!value) {
      toast.error("لا يوجد نص لنسخه")
      return
    }
    try {
      await navigator.clipboard.writeText(value)
      toast.success("تم نسخ كلمة المرور")
    } catch {
      toast.error("تعذر نسخ كلمة المرور")
    }
  }

  async function handleAvatarSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selectedFile) {
      toast.error("اختر صورة أولاً")
      return
    }
    setUploadingAvatar(true)
    try {
      await uploadAvatar({ file: selectedFile })
      setSelectedFile(null)
      setPreviewUrl(null)
    } finally {
      setUploadingAvatar(false)
    }
  }

  async function handleAvatarDelete() {
    setDeletingAvatar(true)
    try {
      await deleteAvatar()
      setSelectedFile(null)
      setPreviewUrl(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } finally {
      setDeletingAvatar(false)
    }
  }

  const passwordRules = {
    hasCurrent: currentPassword.trim().length > 0,
    hasNew: newPassword.trim().length > 0,
    minLength: newPassword.length >= 8,
    confirmed:
      confirmPassword.trim().length > 0 && newPassword === confirmPassword,
  }
  const canSubmitPassword =
    passwordRules.hasCurrent &&
    passwordRules.hasNew &&
    passwordRules.minLength &&
    passwordRules.confirmed &&
    !changingPassword

  return (
    <div className="space-y-5" dir="rtl" lang="ar">
      <Card 
      
      className="overflow-hidden border-border/60 border-e-4 border-e-sky-500/80 shadow-sm">
        <CardHeader className="space-y-1 text-right">
          <CardTitle className="inline-flex items-center  gap-2 text-lg">
            <UserCircle2 className="size-5 text-sky-600 dark:text-sky-400" />
            المعلومات الشخصية
          </CardTitle>
          <CardDescription>تحديث بياناتك كما تظهر داخل النظام</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleProfileSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="profile-name" className="text-right">
                  <User className="size-4 text-sky-600 dark:text-sky-400" />
                  الاسم
                </Label>
                <Input
                  id="profile-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={updating || isLoading}
                  dir="rtl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-email" className="text-right">
                  <Mail className="size-4 text-sky-600 dark:text-sky-400" />
                  البريد الإلكتروني
                </Label>
                <Input
                  id="profile-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={updating}
                  dir="rtl"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="profile-role" className="text-right">
                  <ShieldUser className="size-4 text-sky-600 dark:text-sky-400" />
                  الدور
                </Label>
                <Input
                  id="profile-role"
                  value={roleLabel}
                  disabled
                  readOnly
                  dir="rtl"
                />
              </div>
              <div className="space-y-2">
              <Label htmlFor="profile-username" className="text-right">
                <User className="size-4 text-sky-600 dark:text-sky-400" />
                اسم المستخدم
              </Label>
              <Input
                id="profile-username"
                value={profile?.username ?? ""}
                disabled
                readOnly
                dir="rtl"
              />
            </div>
            </div>
       
            <Separator />
            <div className="flex justify-end">
              <Button type="submit" disabled={updating || isLoading} className="gap-2">
                {updating ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                {updating ? "جار الحفظ" : "حفظ المعلومات الشخصية"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border/60 border-e-4 border-e-indigo-500/80 shadow-sm">
        <CardHeader className="space-y-1 text-right">
          <CardTitle className="inline-flex items-center gap-2 text-lg">
            <KeyRound className="size-5 text-indigo-600 dark:text-indigo-400" />
            كلمة المرور
          </CardTitle>
          <CardDescription>قم بتحديث كلمة المرور الخاصة بك بأمان</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handlePasswordSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="current-password" className="text-right">
                <Lock className="size-4 text-indigo-600 dark:text-indigo-400" />
                  كلمة المرور الحالية
                </Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={changingPassword}
                    dir="rtl"
                    className="ps-20"
                  />
                  <div className="absolute inset-y-0 inset-s-2 flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setShowCurrentPassword((v) => !v)}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => {
                        void handleCopyPassword(currentPassword)
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-right">
                <Lock className="size-4 text-indigo-600 dark:text-indigo-400" />
                  كلمة المرور الجديدة
                </Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={changingPassword}
                    dir="rtl"
                    className="ps-20"
                  />
                  <div className="absolute inset-y-0 inset-s-2 flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setShowNewPassword((v) => !v)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => {
                        void handleCopyPassword(newPassword)
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-right">
              <Lock className="size-4 text-indigo-600 dark:text-indigo-400" />
                تأكيد كلمة المرور
              </Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={changingPassword}
                  dir="rtl"
                  className="ps-20"
                />
                <div className="absolute inset-y-0 inset-s-2 flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => {
                      void handleCopyPassword(confirmPassword)
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3 text-sm">
              <p className="mb-2 font-medium text-indigo-700 dark:text-indigo-300">
                شروط كلمة المرور (مطابقة للباك اند):
              </p>
              <ul className="space-y-1 text-muted-foreground">
                <li className={passwordRules.hasCurrent ? "text-emerald-600 dark:text-emerald-400" : ""}>
                  - إدخال كلمة المرور الحالية (مطلوب).
                </li>
                <li className={passwordRules.hasNew ? "text-emerald-600 dark:text-emerald-400" : ""}>
                  - إدخال كلمة مرور جديدة (مطلوب).
                </li>
                <li className={passwordRules.minLength ? "text-emerald-600 dark:text-emerald-400" : ""}>
                  - الحد الأدنى 8 أحرف.
                </li>
                <li className={passwordRules.confirmed ? "text-emerald-600 dark:text-emerald-400" : ""}>
                  - تأكيد كلمة المرور يجب أن يطابق الجديدة.
                </li>
              </ul>
            </div>
            <Separator />
            <div className="flex justify-end">
              <Button type="submit" disabled={!canSubmitPassword} className="gap-2">
                {changingPassword ? <Loader2 className="size-4 animate-spin" /> : null}
                {changingPassword ? "جار تحديث كلمة المرور" : "تحديث كلمة المرور"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border/60 border-e-4 border-e-amber-500/80 shadow-sm">
        <CardHeader className="space-y-1 text-right">
          <CardTitle className="inline-flex items-center gap-2 text-lg">
            <Camera className="size-5 text-amber-600 dark:text-amber-400" />
            الصورة الشخصية
          </CardTitle>
          <CardDescription>
            قم بتحديث صورتك الشخصية مع معاينة مباشرة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleAvatarSubmit}>
            <div className="flex flex-col items-center gap-6">
              <div className="group relative">
                <div className="absolute inset-0 scale-125 rounded-full bg-blue-500/20 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100 dark:bg-blue-700/40" />
                <div className="absolute inset-0 rounded-full">
                  <div className="absolute inset-[-4px] rounded-full bg-blue-400/20 opacity-60 blur-md dark:bg-blue-900/25" />
                  <div className="absolute inset-[-2px] rounded-full bg-blue-200/30 opacity-80 blur-sm dark:bg-blue-950/30" />
                </div>
                <div className="absolute inset-0 rounded-full ring-2 ring-blue-400/30 shadow-[0_8px_32px_rgba(25,80,160,0.15)] transition-all duration-500 group-hover:ring-blue-500/50 group-hover:shadow-[0_12px_48px_rgba(25,80,160,0.25)] dark:ring-blue-500/40 dark:shadow-[0_8px_32px_rgba(120,180,220,0.2)] dark:group-hover:ring-blue-700/60 dark:group-hover:shadow-[0_12px_48px_rgba(120,180,220,0.3)]" />

                <Avatar className="relative z-10 h-28 w-28 cursor-pointer ring-2 ring-sidebar-border transition-all duration-500 group-hover:scale-105 group-hover:ring-blue-400/60">
                  <AvatarImage
                    src={previewUrl ?? profile?.avatar_url ?? undefined}
                    alt={profile?.name || "Profile"}
                  />
                  <AvatarFallback className="bg-blue-500 text-2xl text-primary-foreground dark:bg-blue-900">
                    {getInitials(profile?.name)}
                  </AvatarFallback>
                </Avatar>
                {uploadingAvatar ? (
                  <div className="absolute inset-0 z-20 flex items-center justify-center rounded-full bg-background/80">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  </div>
                ) : null}
              </div>

            

              <div className="w-full max-w-sm space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                  disabled={uploadingAvatar}
                  className="hidden"
                  id="profile-avatar-upload"
                />
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploadingAvatar || deletingAvatar}
                    className="gap-1.5 sm:gap-2 h-8 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>تغيير الصورة</span>
                  </Button>
                  {(selectedFile || profile?.avatar_url) ? (
                    <Button
                      type="button"
                      variant="destructive"
                      disabled={uploadingAvatar || deletingAvatar}
                      className="gap-1.5 sm:gap-2 h-8 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm"
                      onClick={() => {
                        void handleAvatarDelete()
                      }}
                    >
                      {deletingAvatar ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin sm:h-4 sm:w-4" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      )}
                      <span>{deletingAvatar ? "جار الحذف" : "حذف الصورة"}</span>
                    </Button>
                  ) : null}
                </div>
                <p className="text-center text-[10px] text-muted-foreground sm:text-xs">
                  يفضل استخدام صورة بأبعاد 400×400 بكسل وبصيغة JPG أو PNG أو WEBP.
                </p>
              </div>
            </div>

            <Separator />
            <div className="flex justify-end">
              <Button type="submit" disabled={uploadingAvatar || !selectedFile} className="gap-2">
                {uploadingAvatar ? <Loader2 className="size-4 animate-spin" /> : null}
                {uploadingAvatar ? "جار رفع الصورة" : "حفظ الصورة الشخصية"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border/60 border-e-4 border-e-slate-500/70 shadow-sm">
        <CardHeader className="space-y-1 text-right">
          <CardTitle className="inline-flex items-center  gap-2 text-lg">
            <ShieldUser className="size-5 text-slate-600 dark:text-slate-300" />
            معلومات الحساب
          </CardTitle>
          <CardDescription>بيانات تعريفية للعرض فقط.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="account-id" className="text-right">
            <User className="size-4 text-slate-600 dark:text-slate-300" />
              رقم المستخدم
            </Label>
            <Input id="account-id" value={profile?.id ? String(profile.id) : ""} readOnly disabled dir="rtl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="account-username" className="text-right">
            <User className="size-4 text-slate-600 dark:text-slate-300" />
              اسم الدخول
            </Label>
            <Input id="account-username" value={profile?.username ?? ""} readOnly disabled dir="rtl" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
