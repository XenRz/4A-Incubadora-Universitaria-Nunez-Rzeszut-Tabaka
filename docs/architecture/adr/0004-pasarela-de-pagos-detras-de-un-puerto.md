# ADR-4: Pasarela de pagos detrás de un puerto, con implementación simulada

- **Estado:** Aceptada (diseñada, sin código todavía)
- **Fecha:** 2026-11-03

## Contexto

La pasarela de pagos real no se integra en esta etapa, pero el checkout tiene que quedar diseñado. Es el único sistema externo del escenario.

## Decisión

Vamos a definir un puerto `PaymentGateway` en `modules/pagos/application/ports`, con una implementación simulada en `modules/pagos/infrastructure/external` que aprueba o rechaza según el monto o una regla fija. Corre dentro de `backend`; no es un contenedor aparte.

## Alternativas

- **Integración directa con un proveedor:** ata el desarrollo y los tests a un tercero, a sus credenciales y a la red.

## Consecuencias

- Se prueba sin red ni credenciales; cambiar de proveedor es escribir otro adaptador y cambiar una variable de entorno.
- **Negativas:** se resigna probar contra el comportamiento real del proveedor (demoras, webhooks, reintentos).

## NFRs

Favorece NFR-1 y NFR-2.

## Confirmación

Prevista para cuando se implemente el módulo `pagos`: un test del cobro corre contra el mock, sin red ni credenciales, y cubre un pago aprobado y uno rechazado.
