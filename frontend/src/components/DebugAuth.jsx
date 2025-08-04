import { useAuth } from '../contexts/AuthContext'

const DebugAuth = () => {
  const { user, loading } = useAuth()

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">🔍 Debug Auth</h3>
      <div className="space-y-1">
        <p><strong>Loading:</strong> {loading ? '✅' : '❌'}</p>
        <p><strong>User:</strong> {user ? '✅' : '❌'}</p>
        {user && (
          <>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>UID:</strong> {user.uid}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>DisplayName:</strong> {user.displayName}</p>
          </>
        )}
      </div>
    </div>
  )
}

export default DebugAuth 