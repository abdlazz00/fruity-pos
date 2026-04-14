<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Kode OTP Anda</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
    <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #1A3636; text-align: center;">Reset Password Anda</h2>
        <p style="color: #333333; font-size: 16px;">
            Halo, kami menerima permintaan untuk mengatur ulang kata sandi Anda. Gunakan kode 6-digit di bawah ini untuk melanjutkan. 
            Kode ini akan kedaluwarsa dalam 10 menit.
        </p>
        <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; padding: 15px 30px; background-color: #F0FDF4; color: #16A34A; border-radius: 8px; letter-spacing: 5px;">
                {{ $otp }}
            </span>
        </div>
        <p style="color: #6B7280; font-size: 14px; text-align: center;">
            Jika Anda tidak meminta perubahan kata sandi, Anda dapat mengabaikan email ini dengan aman.
        </p>
        <hr style="border: 0; border-top: 1px solid #E5E7EB; margin: 30px 0;">
        <p style="color: #9CA3AF; font-size: 12px; text-align: center;">
            &copy; {{ date('Y') }} FruityPOS. All rights reserved.
        </p>
    </div>
</body>
</html>
