import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface VehicleModel {
  brand: string;
  model: string;
  dimensions: string;
  seats: number;
  batteryCapacity: number;
  range: number;
  acceleration: number;
  power: number;
  weight: number;
  status: string;
  imageUrl: string;
}

const vehicleModels: VehicleModel[] = [
  {
    brand: 'VinFast',
    model: 'VF 3',
    dimensions: '3190x1675x1600',
    seats: 4,
    batteryCapacity: 18.64,
    range: 210,
    acceleration: 0.5,
    power: 32,
    weight: 1090,
    status: 'ACTIVE',
    imageUrl: 'https://vinfast-cars.vn/wp-content/uploads/2024/10/vinfast-vf3-do.png'
  },
  {
    brand: 'VinFast',
    model: 'VF 5 Plus',
    dimensions: '3967x1723x1578',
    seats: 5,
    batteryCapacity: 37.23,
    range: 326,
    acceleration: 0.5,
    power: 100,
    weight: 1360,
    status: 'ACTIVE',
    imageUrl: 'https://vinfastbinhthanh.com/wp-content/uploads/2024/01/vinfast_vf5_trang-768x768.webp'
  },
  {
    brand: 'VinFast',
    model: 'VF 6',
    dimensions: '4238x1820x1594',
    seats: 5,
    batteryCapacity: 59.6,
    range: 399,
    acceleration: 0.5,
    power: 150,
    weight: 1550,
    status: 'ACTIVE',
    imageUrl: 'https://i.pinimg.com/736x/1c/d6/c8/1cd6c8d23d8815f29ebd852f158e3119.jpg'
  },
  {
    brand: 'VinFast',
    model: 'VF 7',
    dimensions: '4545x1890x1636',
    seats: 5,
    batteryCapacity: 75.3,
    range: 431,
    acceleration: 0.42,
    power: 260,
    weight: 2025,
    status: 'ACTIVE',
    imageUrl: 'https://i.pinimg.com/736x/e3/c9/ae/e3c9aeed275f2b3efcf0f4e008a9992b.jpg'
  },
  {
    brand: 'VinFast',
    model: 'VF 8',
    dimensions: '4750x1934x1667',
    seats: 5,
    batteryCapacity: 87.7,
    range: 471,
    acceleration: 0.43,
    power: 300,
    weight: 2605,
    status: 'ACTIVE',
    imageUrl: 'https://i.pinimg.com/736x/8d/1d/43/8d1d4386aa53db78fa935b4ff4b67161.jpg'
  },
  {
    brand: 'VinFast',
    model: 'VF 9',
    dimensions: '5118x2004x1696',
    seats: 7,
    batteryCapacity: 92,
    range: 438,
    acceleration: 0.43,
    power: 300,
    weight: 2830,
    status: 'ACTIVE',
    imageUrl: 'https://i.pinimg.com/736x/43/e9/17/43e917f48fe53c38185bd39cf750d6d6.jpg'
  },
  {
    brand: 'VinFast',
    model: 'VF e34',
    dimensions: '4300x1768x1613',
    seats: 5,
    batteryCapacity: 41.9,
    range: 318,
    acceleration: 0.3,
    power: 110,
    weight: 1490,
    status: 'ACTIVE',
    imageUrl: 'https://i.pinimg.com/1200x/15/25/28/1525281d921639b33c0bd6308fa7e935.jpg'
  },
  {
    brand: 'VinFast',
    model: 'VF Wild',
    dimensions: '5324x1997xN/A',
    seats: 5,
    batteryCapacity: 120,
    range: 600,
    acceleration: 2.0,
    power: 300,
    weight: 2400,
    status: 'INACTIVE',
    imageUrl: 'https://autopro8.mediacdn.vn/134505113543774208/2024/3/25/nlh4913-17113739622841194169314.jpg'
  }
];

export default function Solutions() {
const navigate = useNavigate();
  const [hoveredVehicle, setHoveredVehicle] = useState<number | null>(null);

  return (
    <div
      className="min-h-screen text-foreground relative overflow-hidden"
      style={{
        background: 'linear-gradient(-45deg, hsl(14, 100%, 68%), hsl(26, 100%, 74%), hsl(16, 100%, 78%), hsl(24, 100%, 83%))',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 15s ease infinite'
      }}
    >
      <style>{`
        @keyframes gradientShift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.8; } }
      `}</style>

      {/* Decorative clouds */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-card/20 rounded-full blur-3xl" style={{ animation: 'float 6s ease-in-out infinite' }}></div>
      <div className="absolute top-40 right-20 w-40 h-40 bg-card/20 rounded-full blur-3xl" style={{ animation: 'float 8s ease-in-out infinite 1s' }}></div>
      <div className="absolute bottom-20 left-1/4 w-36 h-36 bg-card/20 rounded-full blur-3xl" style={{ animation: 'float 7s ease-in-out infinite 2s' }}></div>

      {/* Header Navigation */}
      <header className="w-full bg-white relative z-30 rounded-b-3xl shadow-xl pt-4 pb-4">
        <div className="mx-auto max-w-6xl px-4 flex items-center justify-between">
          <div className="flex items-center gap-3 relative z-30 bg-gradient-to-r from-orange-50 to-orange-100 px-4 py-2 rounded-2xl shadow-lg border border-gray-200"
            style={{
              boxShadow: '0 4px 6px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.5)',
            }}
          >
            <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11C5.84 5 5.28 5.42 5.08 6.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
              </svg>
            </div>
            <span className="font-semibold text-gray-800">VinFast Service Workshop</span>
          </div>
          <div className="flex items-center gap-3 relative z-30">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
className="font-semibold px-6 py-2 rounded-xl border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300 hover:scale-105"
            >
              Trang chủ
            </Button>
            <Button
              onClick={() => navigate('/login')}
              className="bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Đăng nhập
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-14 space-y-10 relative z-20">
        {/* Header Section */}
        <div className="text-center space-y-4" style={{ animation: 'fadeInUp 0.8s ease-out' }}>
          <div className="inline-block mb-4">
            <span className="px-5 py-2 bg-card/20 backdrop-blur-sm text-primary-foreground text-sm font-semibold rounded-full border border-border/30 shadow-lg">
              🚗 Xe điện VinFast
            </span>
          </div>
          <h1
            className="text-5xl md:text-7xl font-black mb-5 text-primary-foreground"
            style={{
              letterSpacing: '-0.03em',
              textShadow: '0 4px 20px rgba(0,0,0,0.3), 0 0 40px rgba(255,255,255,0.1)',
              animation: 'pulse 3s ease-in-out infinite'
            }}
          >
            Dòng xe VinFast chúng tôi sửa chữa
          </h1>
        </div>

        {/* Vehicle Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vehicleModels.map((vehicle, index) => (
            <div
              key={index}
              className={`rounded-xl overflow-hidden bg-card shadow-lg hover:shadow-xl transition-smooth ${vehicle.status === 'INACTIVE' ? 'opacity-60' : ''
                }`}
            >
              {/* Vehicle Image with Overlay Info */}
              <div
                className="relative h-64 bg-gradient-to-br from-muted to-muted cursor-pointer group overflow-hidden"
                onMouseEnter={() => setHoveredVehicle(index)}
                onMouseLeave={() => setHoveredVehicle(null)}
              >
                <img
                  src={vehicle.imageUrl}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=No+Image';
                  }}
                />

                {vehicle.status === 'INACTIVE' && (
                  <div className="absolute top-4 right-4 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-sm font-semibold z-10">
                    Ngừng sản xuất
                  </div>
                )}
{/* Overlay Info - Show on hover */}
                {hoveredVehicle === index && (
                  <div className="absolute inset-0 bg-black/75 backdrop-blur-sm p-6 flex flex-col justify-end animate-in fade-in duration-300">
                    <div className="text-white space-y-3">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div>
                          <p className="text-white/70">Số chỗ ngồi</p>
                          <p className="font-semibold">{vehicle.seats} chỗ</p>
                        </div>
                        <div>
                          <p className="text-white/70">Pin</p>
                          <p className="font-semibold">{vehicle.batteryCapacity} kWh</p>
                        </div>
                        <div>
                          <p className="text-white/70">Quãng đường</p>
                          <p className="font-semibold">{vehicle.range} km</p>
                        </div>
                        <div>
                          <p className="text-white/70">Công suất</p>
                          <p className="font-semibold">{vehicle.power} kW</p>
                        </div>
                        <div>
                          <p className="text-white/70">Tăng tốc</p>
                          <p className="font-semibold">{vehicle.acceleration}s (0-100km/h)</p>
                        </div>
                        <div>
                          <p className="text-white/70">Trọng lượng</p>
                          <p className="font-semibold">{vehicle.weight} kg</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Vehicle Title - Always visible */}
              <div className="p-6 bg-card">
                <h3 className="text-2xl font-bold text-foreground">{vehicle.model}</h3>
                <p className="text-muted-foreground">{vehicle.brand}</p>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}