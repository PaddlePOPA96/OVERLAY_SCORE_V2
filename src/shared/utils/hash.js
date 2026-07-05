export async function hashPasscode(passcode) {
  const encoder = new TextEncoder()
  const salt = process.env.NEXT_PUBLIC_PASSCODE_SALT || '_DEFAULT_SCOREBOS_SALT'
  const data = encoder.encode(passcode + salt)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}
