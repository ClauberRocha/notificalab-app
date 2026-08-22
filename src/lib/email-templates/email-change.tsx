import * as React from 'react'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components'

import { badge, button, container, footer, h1, hr, link, main, text } from './styles'

interface EmailChangeEmailProps {
  siteName: string
  oldEmail: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  siteName,
  oldEmail,
  email,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Confirme seu novo e-mail no {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={badge}>{siteName}</Text>
        <Heading style={h1}>Confirme seu novo e-mail</Heading>
        <Text style={text}>
          Foi solicitada a troca do e-mail de acesso de{' '}
          <strong>{oldEmail || email}</strong> para <strong>{newEmail || email}</strong>.
        </Text>
        <Text style={text}>Para concluir a alteração, confirme abaixo:</Text>
        <Button style={button} href={confirmationUrl}>
          Confirmar alteração
        </Button>
        <Text style={text}>
          Se o botão não funcionar, copie e cole este endereço no navegador:
          <br />
          <Link href={confirmationUrl} style={link}>
            {confirmationUrl}
          </Link>
        </Text>
        <Hr style={hr} />
        <Text style={footer}>
          Se você não solicitou esta troca, ignore esta mensagem e avise a equipe
          responsável.
        </Text>
        <Text style={footer}>Desenvolvido por GERTEC/ConsulTI · +55 (98) 98600-1270</Text>
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail
