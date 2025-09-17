import { useRouter } from 'next/router'
import Link from 'next/link'

export default function Unauthorized() {
  const router = useRouter()

  return (
    <div className="error-container">
      <div className="error-content">
        <h1>🚫 접근 권한이 없습니다</h1>
        <p>이 페이지에 접근할 수 있는 권한이 없습니다.</p>
        <p>관리자에게 문의하시거나 올바른 계정으로 로그인해주세요.</p>
        
        <div className="error-actions">
          <button onClick={() => router.back()} className="btn-secondary">
            이전 페이지로
          </button>
          <Link href="/" className="btn-primary">
            홈으로 가기
          </Link>
        </div>
      </div>
    </div>
  )
} 