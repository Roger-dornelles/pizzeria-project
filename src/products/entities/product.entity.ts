import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'product' })
export class Product {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'userId' })
  userId: number;

  @Column({ name: 'nameProduct', length: 100 })
  nameProduct: string;

  @Column({ name: 'descriptionProduct', length: 200 })
  descriptionProduct: string;

  @Column({ name: 'valueProduct', length: 15 })
  valueProduct: string;
  
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
