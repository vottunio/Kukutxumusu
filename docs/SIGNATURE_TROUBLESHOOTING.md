# Guía de Troubleshooting - Problemas de Firma

## 🚨 Error: "Invalid signature"

Este error indica que la firma generada por el relayer no es válida según el contrato inteligente. Aquí están las causas más comunes y sus soluciones:

## 🔍 **Diagnóstico del Problema**

### **1. Verificar Configuración del Trusted Signer**

```bash
# Verificar que la variable de entorno esté configurada
echo $TRUSTED_SIGNER_PRIVATE_KEY

# Debería mostrar algo como: 0x1234567890abcdef...
```

**Problema común**: La variable `TRUSTED_SIGNER_PRIVATE_KEY` no está configurada o es incorrecta.

**Solución**:
```bash
# Configurar en .env.local
TRUSTED_SIGNER_PRIVATE_KEY=0x1234567890abcdef...
```

### **2. Verificar que el Trusted Signer Coincida con el Contrato**

El contrato debe tener configurado el mismo address que corresponde a la private key.

**Verificar en el contrato**:
```solidity
// En el contrato, verificar:
address public trustedSigner;
```

**Verificar desde el frontend**:
```typescript
// Usar el endpoint de debug
GET /api/debug-signature
```

### **3. Verificar Formato de la Firma**

Las firmas Ethereum deben tener exactamente 65 bytes (132 caracteres con 0x).

**Formato correcto**:
```
0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234
```

**Verificaciones**:
- ✅ Debe empezar con `0x`
- ✅ Debe tener exactamente 132 caracteres
- ✅ Solo debe contener caracteres hexadecimales (0-9, a-f, A-F)

## 🛠️ **Soluciones Paso a Paso**

### **Paso 1: Verificar Configuración**

```bash
# 1. Verificar variables de entorno
cat .env.local | grep TRUSTED_SIGNER

# 2. Verificar que el servidor esté usando las variables correctas
npm run dev
# Buscar en los logs: "Trusted signer address: 0x..."

# 3. Probar el endpoint de debug
curl http://localhost:3000/api/debug-signature
```

### **Paso 2: Regenerar Private Key (si es necesario)**

Si la private key está incorrecta o perdida:

```bash
# Generar nueva private key (solo para testing)
node -e "console.log('0x' + require('crypto').randomBytes(32).toString('hex'))"

# Configurar en .env.local
TRUSTED_SIGNER_PRIVATE_KEY=0x[new_private_key]

# Actualizar el contrato con el nuevo address
# (Esto requiere acceso de admin al contrato)
```

### **Paso 3: Verificar Proceso de Firma**

```typescript
// Usar el endpoint de debug para probar
const response = await fetch('/api/debug-signature', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    auctionId: 1,
    bidder: '0x090378a9c80c5E1Ced85e56B2128c1e514E75357',
    tokenAddress: '0x0000000000000000000000000000000000000000',
    amount: '1000000000000000000'
  })
})

const result = await response.json()
console.log('Signature test result:', result)
```

### **Paso 4: Verificar Timestamp**

Las firmas expiran después de 5 minutos. Verificar que el timestamp sea reciente:

```typescript
const timestamp = Math.floor(Date.now() / 1000)
const age = timestamp - signatureTimestamp
if (age > 300) { // 5 minutos
  console.error('Signature expired!')
}
```

## 🔧 **Debugging Avanzado**

### **1. Logs del Servidor**

Buscar en los logs del servidor (terminal donde corre `npm run dev`):

```
🔐 [SIGNATURE] Starting signature process...
🔐 [SIGNATURE] Trusted signer address: 0x...
🔐 [SIGNATURE] Input data: {...}
🔐 [SIGNATURE] Generated message hash: 0x...
🔐 [SIGNATURE] Generated signature: 0x...
✅ [SIGNATURE] Signature generated successfully
```

### **2. Verificar Hash del Mensaje**

El hash del mensaje debe ser consistente. Verificar que el encoding sea correcto:

```typescript
import { encodePacked, keccak256 } from 'viem'

const encoded = encodePacked(
  ['uint256', 'address', 'address', 'uint256', 'uint256', 'uint256'],
  [
    BigInt(auctionId),
    bidder,
    tokenAddress,
    amount,
    valueInUSD,
    BigInt(timestamp),
  ]
)

const messageHash = keccak256(encoded)
console.log('Expected message hash:', messageHash)
```

### **3. Verificar en el Contrato**

Si tienes acceso al contrato, verificar la función de validación:

```solidity
function verifySignature(
  uint256 auctionId,
  address bidder,
  address tokenAddress,
  uint256 amount,
  uint256 valueInUSD,
  uint256 timestamp,
  bytes memory signature
) public view returns (bool) {
  bytes32 messageHash = keccak256(abi.encodePacked(
    auctionId,
    bidder,
    tokenAddress,
    amount,
    valueInUSD,
    timestamp
  ));
  
  return ECDSA.recover(messageHash, signature) == trustedSigner;
}
```

## 🚨 **Problemas Comunes y Soluciones**

### **Problema 1: "TRUSTED_SIGNER_PRIVATE_KEY not set"**

**Causa**: Variable de entorno no configurada.

**Solución**:
```bash
# Configurar en .env.local
echo "TRUSTED_SIGNER_PRIVATE_KEY=0x1234567890abcdef..." >> .env.local

# Reiniciar el servidor
npm run dev
```

### **Problema 2: "Signature length is incorrect"**

**Causa**: Error en la generación de la firma.

**Solución**:
```typescript
// Verificar que la firma tenga 65 bytes
if (signature.length !== 132) {
  throw new Error(`Invalid signature length: ${signature.length}`)
}
```

### **Problema 3: "Trusted signer address mismatch"**

**Causa**: El address del trusted signer en el contrato no coincide con la private key.

**Solución**:
1. Verificar el address actual del contrato
2. Verificar que la private key genere ese address
3. Actualizar el contrato si es necesario

### **Problema 4: "Signature expired"**

**Causa**: La firma es demasiado antigua (>5 minutos).

**Solución**:
```typescript
// Generar nueva firma
const timestamp = Math.floor(Date.now() / 1000)
const newSignature = await signBidData({...data, timestamp})
```

## 📋 **Checklist de Verificación**

- [ ] Variable `TRUSTED_SIGNER_PRIVATE_KEY` configurada
- [ ] Private key genera el address correcto
- [ ] Address coincide con el configurado en el contrato
- [ ] Firma tiene formato correcto (65 bytes)
- [ ] Timestamp es reciente (<5 minutos)
- [ ] Hash del mensaje se genera correctamente
- [ ] Servidor se reinició después de cambios en .env

## 🔄 **Flujo de Debugging Recomendado**

1. **Verificar configuración básica**
   ```bash
   curl http://localhost:3000/api/debug-signature
   ```

2. **Probar generación de firma**
   ```bash
   curl -X POST http://localhost:3000/api/debug-signature \
     -H "Content-Type: application/json" \
     -d '{"auctionId":1,"bidder":"0x...","tokenAddress":"0x...","amount":"1000000000000000000"}'
   ```

3. **Verificar logs del servidor**
   - Buscar errores en la consola
   - Verificar que el trusted signer esté configurado

4. **Probar con datos reales**
   - Usar el mismo auctionId, bidder, etc. que falló
   - Comparar con la transacción que falló

5. **Contactar al equipo técnico** si el problema persiste

---

*Esta guía se actualiza con nuevos problemas y soluciones según se descubran.*
