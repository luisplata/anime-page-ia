
import { Mail, ExternalLink, FileText, ShieldCheck, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const appVersion = import.meta.env.VITE_APP_VERSION;

  return (
    <footer className="bg-muted/50 text-muted-foreground py-8 border-t">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <p className="text-sm">
                &copy; {currentYear} AnimeBell. Todos los derechos reservados.
              </p>
              {appVersion && <Badge variant="outline">v{appVersion}</Badge>}
            </div>
            <p className="text-xs mt-1">
              Desarrollado por{' '}
              <a
                href="https://www.bellseboss.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:text-accent/80 font-medium inline-flex items-center"
              >
                bellseboss <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-sm">
            <Button variant="link" asChild className="text-muted-foreground hover:text-accent p-1 h-auto">
              <Link to="/politicas-de-privacidad" className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" /> Políticas de Privacidad
              </Link>
            </Button>
            <Button variant="link" asChild className="text-muted-foreground hover:text-accent p-1 h-auto">
              <Link to="/terminos-y-condiciones" className="inline-flex items-center gap-1.5">
                <FileText className="h-4 w-4" /> Términos y Condiciones
              </Link>
            </Button>
            <Button variant="link" asChild className="text-muted-foreground hover:text-accent p-1 h-auto">
              <Link to="/devlog" className="inline-flex items-center gap-1.5">
                <Code className="h-4 w-4" /> Devlog
              </Link>
            </Button>
          </div>

          <div className="text-center md:text-right">
            <a
              href="mailto:info@bellseboss.com"
              className="text-sm text-accent hover:text-accent/80 inline-flex items-center gap-1.5"
            >
              <Mail className="h-4 w-4" />
              info@bellseboss.com
            </a>
            <p className="text-xs mt-1">
                Este sitio no almacena ningún video en sus servidores. Todo el contenido es proporcionado por terceros no afiliados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
