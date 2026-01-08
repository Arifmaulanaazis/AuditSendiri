# Generate JWT Secret (Windows PowerShell)

# Since OpenSSL is not available on Windows, use this PowerShell script to generate a secure JWT secret

# Generate 64 bytes of random data and convert to Base64
$bytes = New-Object byte[] 64
[System.Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)

# Copy the output and use it as your JWT_SECRET in .env file
