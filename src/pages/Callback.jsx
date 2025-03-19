import React, { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Callback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (code) {
            axios.post(
                "http://192.168.2.59:8080/realms/sso/protocol/openid-connect/token",
                new URLSearchParams({
                    grant_type: "authorization_code",
                    client_id: "chrome-ext",
                    client_secret: "PGECw0T1tVC5xlfPWwkjjchYwrnZc7eF",
                    code: code,
                    redirect_uri: "http://192.168.2.47:5173/callback"
                }),
                {
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    withCredentials: true // 🔥 토큰을 쿠키로 자동 저장
                }
            ).then(response => {
                console.log("✅ Access Token:", response.data.access_token);

                // 🛡️ httpOnly 쿠키에 저장하여 보안 강화
                document.cookie = `access_token=${response.data.access_token}; HttpOnly; Path=/;`;
                
                // ✅ 로그인 상태 업데이트 (상태 관리 적용 가능)
                localStorage.setItem("isLogin", true);

                // 🔄 로그인 성공 후 메인 페이지로 이동
                navigate("/");
            }).catch(error => {
                console.error("❌ 토큰 요청 실패:", error);
                navigate("/login");
            });
        }
    }, [navigate]);

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h2>🔄 로그인 처리 중...</h2>
        </div>
    );
};

export default Callback;