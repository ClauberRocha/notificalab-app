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

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({ siteName, siteUrl, confirmationUrl }: InviteEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Você recebeu acesso ao {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={badge}>{siteName}</Text>
        <Heading style={h1}>Você recebeu um acesso</Heading>
        <Text style={text}>
          Foi criado um acesso para você no{' '}
          <Link href={siteUrl} style={link}>
            <strong>{siteName}</strong>
          </Link>
          .
        </Text>
        <Text style={text}>
          Clique no botão abaixo para definir sua senha e entrar no sistema:
        </Text>
        <Button style={button} href={confirmationUrl}>
          Definir minha senha
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
          Este link é pessoal e expira por segurança. Se não esperava este convite, ignore
          esta mensagem.
        </Text>
        <Text style={footer}>Desenvolvido por GERTEC/ConsulTI · +55 (98) 98600-1270</Text>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail
