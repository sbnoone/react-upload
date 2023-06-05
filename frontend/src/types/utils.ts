export type OverrideProps<CurrentProps, NewProps> = Omit<CurrentProps, keyof NewProps> & NewProps
