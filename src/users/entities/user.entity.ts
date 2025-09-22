import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'user' })
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'name', length: 100 })
  name: string;

  @Column({ name: 'email', length: 150, unique: true })
  email: string;

  @Column({ name: 'password', length: 150 })
  password: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
