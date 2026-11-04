
const TextElipse = ({value, number}) => {
  return (
    <>{value?.length > number ? `${value.substring(0, number)}...` : value}</>
  );
}

export default TextElipse;