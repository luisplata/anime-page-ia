
import { Mail, ExternalLink } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/50 text-muted-foreground py-8 border-t">
      <div className="container mx-auto px-4 text-center sm:text-left">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div>
            <p className="text-sm">
              &copy; {currentYear} AnimeBell. Todos los derechos reservados.
            </p>
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
          <div className="sm:text-right">
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
