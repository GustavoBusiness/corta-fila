import { ServiceType, getServiceTypeColor } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

interface ServiceTagProps {
  type: ServiceType;
  className?: string;
}

const ServiceTag = ({ type, className }: ServiceTagProps) => {
  const labels: Record<ServiceType, string> = {
    corte: 'Corte',
    barba: 'Barba',
    combo: 'Combo',
    pigmentacao: 'Pigmentação',
    hidratacao: 'Hidratação'
  };

  return (
    <span className={cn('service-tag', getServiceTypeColor(type), className)}>
      {labels[type]}
    </span>
  );
};

export default ServiceTag;
