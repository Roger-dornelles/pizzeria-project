import { Transform } from 'class-transformer';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export interface FilesProps {
  name: string;
  path: string;
  url: string;
}

@Entity({ name: 'product' })
export class Product {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Transform(({ value }) => Number(value))
  @Column({ name: 'userId' })
  userId: number;

  @Column({ name: 'nameProduct', length: 100 })
  nameProduct: string;

  @Column({ name: 'descriptionProduct', length: 200 })
  descriptionProduct: string;

  @Column({ name: 'valueProduct', length: 15 })
  valueProduct: string;

  @Column('simple-json', { nullable: true })
  files: FilesProps[] | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
