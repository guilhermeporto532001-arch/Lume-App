import React, { useState } from 'react';
import { Package, Plus, AlertCircle, ShoppingBag, Sparkles } from 'lucide-react';
import { ProductItem } from '../types';

interface ProdutosViewProps {
  products: ProductItem[];
  onAddProduct: (product: ProductItem) => void;
  onUpdateStock: (id: string, delta: number) => void;
}

export const ProdutosView: React.FC<ProdutosViewProps> = ({
  products,
  onAddProduct,
  onUpdateStock,
}) => {
  const [filterCat, setFilterCat] = useState<'todos' | 'cabine' | 'homecare'>('todos');
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'cabine' | 'homecare'>('cabine');
  const [stock, setStock] = useState('5');
  const [minStock, setMinStock] = useState('3');
  const [price, setPrice] = useState('80.00');
  const [unit, setUnit] = useState('Frasco');

  const filtered = products.filter((p) => {
    if (filterCat === 'todos') return true;
    return p.category === filterCat;
  });

  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newProd: ProductItem = {
      id: `prd-${Date.now()}`,
      name: name.trim(),
      category,
      stock: parseInt(stock, 10) || 0,
      minStock: parseInt(minStock, 10) || 0,
      price: parseFloat(price) || 0,
      unit,
    };

    onAddProduct(newProd);
    setName('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-[#EFE5E0] shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-[#423533]">Estoque e Dermocosméticos</h2>
          <p className="text-xs text-[#8C7B76]">
            Produtos para uso profissional em cabine e venda home care para clientes
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#9E4B52] hover:bg-[#883B41] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Produto</span>
        </button>
      </div>

      {/* Filter and stats row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-[#EFE5E0] shadow-2xs">
          {[
            { id: 'todos', label: 'Todos os Produtos' },
            { id: 'cabine', label: 'Uso em Cabine' },
            { id: 'homecare', label: 'Venda Home Care' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterCat(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filterCat === tab.id
                  ? 'bg-[#FDF2F2] text-[#9E4B52] border border-[#F5D8DB]'
                  : 'text-[#7E6963] hover:text-[#423533] hover:bg-[#FAF5F2]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {lowStockCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 font-medium">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>{lowStockCount} produto(s) abaixo do estoque mínimo</span>
          </div>
        )}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-3xl border border-[#EFE5E0]">
            <p className="text-sm font-semibold text-[#423533]">Nenhum produto cadastrado no estoque.</p>
            <p className="text-xs text-[#8C7B76] mt-1">Cadastre dermocosméticos de cabine ou itens de revenda home care.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#9E4B52] hover:bg-[#883B41] text-white text-xs font-semibold rounded-xl transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Primeiro Produto</span>
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-3xl border border-[#EFE5E0]">
            <p className="text-sm text-[#8C7B76]">Nenhum produto encontrado nesta categoria.</p>
            <button
              onClick={() => setFilterCat('todos')}
              className="mt-2 text-xs font-semibold text-[#9E4B52] hover:underline"
            >
              Ver todos os produtos
            </button>
          </div>
        ) : (
          filtered.map((prod) => {
          const isLow = prod.stock <= prod.minStock;

          return (
            <div
              key={prod.id}
              className={`flex flex-col justify-between p-5 rounded-3xl bg-white border transition-all ${
                isLow
                  ? 'border-amber-200 shadow-2xs bg-gradient-to-b from-amber-50/20 to-white'
                  : 'border-[#EFE5E0] shadow-2xs hover:border-[#E8DDD7]'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      prod.category === 'cabine'
                        ? 'bg-[#F5EFEF] text-[#8C4F55]'
                        : 'bg-[#F2F5EF] text-[#4F7E43]'
                    }`}
                  >
                    {prod.category === 'cabine' ? 'Uso em Cabine' : 'Venda Home Care'}
                  </span>

                  <span className="text-xs font-bold text-[#423533] tabular-nums">
                    R$ {prod.price.toFixed(2)}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[#423533] mb-1">{prod.name}</h3>
                <p className="text-xs text-[#8C7B76]">{prod.unit}</p>

                {isLow && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-800 font-medium bg-amber-50 p-2 rounded-xl">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Estoque baixo (mínimo: {prod.minStock})</span>
                  </div>
                )}
              </div>

              {/* Bottom Stock Adjuster */}
              <div className="pt-4 mt-4 border-t border-[#F7EFEA] flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-[#A3928B]">Em estoque:</span>
                  <p className="text-sm font-bold text-[#423533] tabular-nums">
                    {prod.stock} un.
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onUpdateStock(prod.id, -1)}
                    disabled={prod.stock <= 0}
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-sm disabled:opacity-40"
                  >
                    -
                  </button>
                  <button
                    onClick={() => onUpdateStock(prod.id, 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#F5D8DB] hover:bg-[#E9BEBF] text-[#7A363C] font-bold text-sm"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          );
        }))}
      </div>

      {/* Modal Add Product */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-[#EFE5E0] p-6 space-y-4">
            <h3 className="text-base font-bold text-[#423533]">Cadastrar Novo Produto</h3>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#544643] mb-1">
                  Nome do Produto
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Tônico Facial Calmante"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#E4D7D2] focus:border-[#9E4B52] outline-hidden text-[#423533]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#544643] mb-1">
                  Finalidade
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#E4D7D2] focus:border-[#9E4B52] outline-hidden text-[#423533] bg-white"
                >
                  <option value="cabine">Uso Profissional em Cabine</option>
                  <option value="homecare">Revenda Home Care para Cliente</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#544643] mb-1">
                    Estoque Atual
                  </label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#E4D7D2] focus:border-[#9E4B52] outline-hidden text-[#423533]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#544643] mb-1">
                    Estoque Mínimo
                  </label>
                  <input
                    type="number"
                    required
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#E4D7D2] focus:border-[#9E4B52] outline-hidden text-[#423533]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#544643] mb-1">
                    Preço (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#E4D7D2] focus:border-[#9E4B52] outline-hidden text-[#423533]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#544643] mb-1">
                    Embalagem / Volume
                  </label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="Ex: Frasco 200ml"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#E4D7D2] focus:border-[#9E4B52] outline-hidden text-[#423533]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#F4EBE6]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#7E6963] hover:text-[#423533]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#9E4B52] hover:bg-[#883B41] text-white text-xs font-semibold rounded-xl"
                >
                  Salvar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
