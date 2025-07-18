<div className="bg-[#F2EFE2] rounded-lg p-6">
  <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
    <div>
      <label className="block text-black mb-1 font-bold">Email du destinataire</label>
      <input
        value={invoice.client.email}
        onChange={(e) => setInvoice(prev => ({
          ...prev,
          client: { ...prev.client, email: e.target.value }
        }))}
        type="email"
        className="w-full md:w-64 border-2 border-[#477A0C] rounded-lg px-4 py-3 focus:border-[#F55D3E] focus:ring-2 focus:ring-[#89BBFE] transition-all bg-white text-black font-bold"
        placeholder="client@email.com"
      />
    </div>
    <div className="flex flex-wrap gap-3 justify-center">
      {/* BOUTON APERÇU & PDF SUPPRIMÉ */}
      <button
        onClick={handleSaveInvoice}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center space-x-3 font-bold shadow-lg transform transition-all hover:scale-105"
      >
        <span>ENREGISTRER</span>
      </button>
      {/* 🆕 BOUTON NOUVELLE FACTURE MAINTENANT CLIQUABLE */}
      <button
        onClick={handleNewInvoice}
        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl flex items-center space-x-3 font-bold shadow-lg transform transition-all hover:scale-105"
        title="Créer une nouvelle facture (remet tout à zéro)"
      >
        <span>✨</span>
        <span>NOUVELLE FACTURE</span>
      </button>
    </div>
  </div>
</div>
