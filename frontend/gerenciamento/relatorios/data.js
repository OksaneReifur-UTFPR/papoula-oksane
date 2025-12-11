// data.js - dados mock para os relatórios
// Estrutura esperada:
// sales = [
//  { id, date: "YYYY-MM-DD", buyer: { id, name, email }, items: [{flower, qty, price}], total }
// ]
// Substitua por seus dados reais mantendo a estrutura.

const sales = [
  { id: 1, date:"2025-01-12", buyer:{id:101,name:"Ana Souza",email:"ana@example.com"}, items:[{flower:"Rosa Vermelha",qty:3,price:15},{flower:"Lírio Branco",qty:1,price:12}], total: (3*15+1*12) },
  { id: 2, date:"2025-01-30", buyer:{id:102,name:"Bruno Lima",email:"bruno@example.com"}, items:[{flower:"Tulipa Rosa",qty:5,price:8}], total: (5*8) },
  { id: 3, date:"2025-02-14", buyer:{id:103,name:"Carla Dias",email:"carla@example.com"}, items:[{flower:"Rosa Vermelha",qty:12,price:15}], total: (12*15) },
  { id: 4, date:"2025-02-20", buyer:{id:101,name:"Ana Souza",email:"ana@example.com"}, items:[{flower:"Margarida Amarela",qty:10,price:5}], total: (10*5) },
  { id: 5, date:"2025-03-05", buyer:{id:104,name:"Diego Rocha",email:"diego@example.com"}, items:[{flower:"Orquídea",qty:2,price:40}], total: (2*40) },
  { id: 6, date:"2025-03-18", buyer:{id:105,name:"Elisa Moraes",email:"elisa@example.com"}, items:[{flower:"Rosa Vermelha",qty:7,price:15}], total: (7*15) },
  { id: 7, date:"2025-04-02", buyer:{id:106,name:"Felipe Costa",email:"felipe@example.com"}, items:[{flower:"Tulipa Rosa",qty:8,price:8}], total: (8*8) },
  { id: 8, date:"2025-04-21", buyer:{id:107,name:"Gabi Alves",email:"gabi@example.com"}, items:[{flower:"Lírio Branco",qty:4,price:12}], total: (4*12) },
  { id: 9, date:"2025-05-12", buyer:{id:108,name:"Hugo Reis",email:"hugo@example.com"}, items:[{flower:"Rosa Vermelha",qty:20,price:15}], total: (20*15) },
  { id:10, date:"2025-06-05", buyer:{id:109,name:"Isabela Fernandes",email:"isa@example.com"}, items:[{flower:"Margarida Amarela",qty:18,price:5}], total: (18*5) },
  { id:11, date:"2025-07-09", buyer:{id:110,name:"Júlio Antunes",email:"julio@example.com"}, items:[{flower:"Orquídea",qty:3,price:40}], total: (3*40) },
  { id:12, date:"2025-07-22", buyer:{id:103,name:"Carla Dias",email:"carla@example.com"}, items:[{flower:"Rosa Vermelha",qty:6,price:15}], total: (6*15) },
  { id:13, date:"2025-08-01", buyer:{id:111,name:"Karina Lopes",email:"karina@example.com"}, items:[{flower:"Girassol",qty:9,price:7}], total: (9*7) },
  { id:14, date:"2025-08-14", buyer:{id:101,name:"Ana Souza",email:"ana@example.com"}, items:[{flower:"Rosa Vermelha",qty:4,price:15},{flower:"Tulipa Rosa",qty:6,price:8}], total: (4*15+6*8) },
  { id:15, date:"2025-09-10", buyer:{id:112,name:"Lucas Silva",email:"lucas@example.com"}, items:[{flower:"Lírio Branco",qty:15,price:12}], total: (15*12) },
  { id:16, date:"2025-10-03", buyer:{id:113,name:"Mariana Pinto",email:"mariana@example.com"}, items:[{flower:"Rosa Vermelha",qty:2,price:15}], total: (2*15) },
  { id:17, date:"2025-10-28", buyer:{id:108,name:"Hugo Reis",email:"hugo@example.com"}, items:[{flower:"Tulipa Rosa",qty:20,price:8}], total: (20*8) },
  { id:18, date:"2025-11-11", buyer:{id:114,name:"Natália Rocha",email:"natalia@example.com"}, items:[{flower:"Orquídea",qty:6,price:40}], total: (6*40) },
  { id:19, date:"2025-11-27", buyer:{id:115,name:"Otávio Nunes",email:"otavio@example.com"}, items:[{flower:"Rosa Vermelha",qty:10,price:15}], total: (10*15) },
  { id:20, date:"2025-12-01", buyer:{id:101,name:"Ana Souza",email:"ana@example.com"}, items:[{flower:"Girassol",qty:3,price:7},{flower:"Rosa Vermelha",qty:1,price:15}], total: (3*7+1*15) }
];

// Export for other modules (if loaded via <script>)
if (typeof window !== "undefined") {
  window.sales = sales;
}