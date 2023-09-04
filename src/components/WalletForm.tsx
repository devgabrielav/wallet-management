import { ChangeEvent, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  CoinType, Dispatch, ExpenseType, ExpenseTypeCurr, GlobalStateType } from '../types';
import { addNewExpense, fetchCurrencies, edit, saveEdit } from '../redux/actions';

function WalletForm() {
  const { expenses, editor, idToEdit } = useSelector((globalState: GlobalStateType) => (
    globalState.wallet));
  const { currencies } = useSelector((globalState: GlobalStateType) => (
    globalState.wallet
  ));
  const [isLoading, setIsLoading] = useState(false);
  const initialValue = {
    id: 0,
    value: '',
    currency: 'USD',
    method: 'Dinheiro',
    tag: 'Alimentação',
    description: '',
  };

  const [expensesInfo, setExpensesInfo] = useState<ExpenseType>(initialValue);
  const [typeButton, setTypeButton] = useState(true);

  useEffect(() => {
    if (editor === true) {
      setTypeButton(false);
      const correctExpense = expenses.find((expense) => expense.id === idToEdit);
      setExpensesInfo(correctExpense as ExpenseType);
    } else {
      setTypeButton(true);
    }
  }, [editor, expenses, idToEdit]);

  const saveChanges = () => {
    dispatch(saveEdit(expensesInfo as ExpenseTypeCurr));
    dispatch(edit(editor));
  };

  const dispatch: Dispatch = useDispatch();

  useEffect(() => {
    setIsLoading(true);
    dispatch(fetchCurrencies());
    setIsLoading(false);
  }, [dispatch]);

  const submitExpense = async () => {
    const response = await fetch('https://economia.awesomeapi.com.br/json/all');
    const fetchedCoin: CoinType[] = await response.json();
    const lastIndex = expenses.length - 1;
    const results = {
      ...expensesInfo,
      id: expenses.length === 0 ? 0 : lastIndex + 1,
      exchangeRates: fetchedCoin,
    };
    dispatch(addNewExpense(results));
    setExpensesInfo({
      ...expensesInfo,
      value: '',
      description: '',
    });
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement
  & HTMLOptionElement
  & HTMLSelectElement
  & HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setExpensesInfo({
      ...expensesInfo,
      [name]: value,
    });
  };

  if (isLoading) {
    return (
      <h1>Carregando...</h1>
    );
  }

  return (
    <form onSubmit={ (e) => e.preventDefault() }>
      <input
        type="number"
        data-testid="value-input"
        name="value"
        onChange={ handleChange }
        value={ expensesInfo.value }
      />
      <textarea
        name="description"
        data-testid="description-input"
        onChange={ handleChange }
        value={ expensesInfo.description }
      />
      <select data-testid="currency-input" name="currency" onChange={ handleChange }>
        { currencies.map((currency) => (
          <option
            value={ currency }
            key={ currency }
          >
            {currency}
          </option>
        )) }
      </select>
      <select data-testid="method-input" name="method" onChange={ handleChange }>
        <option value="Dinheiro">Dinheiro</option>
        <option value="Cartão de crédito">Cartão de crédito</option>
        <option value="Cartão de débito">Cartão de débito</option>
      </select>
      <select data-testid="tag-input" name="tag" onChange={ handleChange }>
        <option value="Alimentação">Alimentação</option>
        <option value="Lazer">Lazer</option>
        <option value="Trabalho">Trabalho</option>
        <option value="Transporte">Transporte</option>
        <option value="Saúde">Saúde</option>
      </select>
      {typeButton ? (
        <button
          type="submit"
          onClick={ submitExpense }
        >
          Adicionar despesa
        </button>
      ) : (
        <button data-testid="edit-btn" onClick={ saveChanges }>Editar despesa</button>
      )}

    </form>
  );
}

export default WalletForm;
