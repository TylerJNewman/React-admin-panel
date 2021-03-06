import React, { useReducer, useEffect, useState } from 'react'
import Axios from '../Axios'
import { Card, CardGroup, Button, Container, CardColumns } from 'react-bootstrap'
import Swal from 'sweetalert2'
import { useHistory } from 'react-router-dom'
import { useToasts } from 'react-toast-notifications'
import BrandEditModal from './BrandEdit'
import { Edit, Trash2 } from 'react-feather'

const brandReducer = (state, action) => {
	switch (action.type) {
		case 'SHOW_BRAND':
			return action.payload
		case 'REMOVE_BRAND':
			return state.filter((key) => key.name !== action.payload)
		default:
			return state
	}
}

const Brand = () => {
	const [brand, dispatch] = useReducer(brandReducer, [])
	const [filteredBrand, setFilteredBrand] = useState([])
	const [show, setShow] = useState(false)
	const baseURL = 'http://localhost:8000/'
	const history = useHistory()
	const { addToast } = useToasts()

	const handleClose = () => {
		setShow(false)
		showBrand()
	}
	const handleShow = () => setShow(true)

	const showBrand = async () => {
		const response = await Axios.get('/admin/showBrand')
		dispatch({
			type: 'SHOW_BRAND',
			payload: response.data.brand
		})
	}

	const editBrand = (name) => {
		const result = brand.filter((key) => key.name === name)
		setFilteredBrand(result)
		handleShow()
	}

	const removeBrand = (name) => {
		Swal.fire({
			title: 'Are you sure?',
			text: `You want to delete ${name}`,
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Yes, delete it!',
			cancelButtonText: 'No, keep it'
		}).then(async (result) => {
			if (result.value) {
				const response = await Axios.delete(`/admin/brandRemove/${name}`).catch((error) => {
					if (error.response) {
						addToast("Something's Went Wrong!", {
							appearance: 'error',
							autoDismiss: true
						})
					}
				})
				if (response.data.name) {
					addToast('Brand removed!', {
						appearance: 'warning',
						autoDismiss: true
					})
					dispatch({
						type: 'REMOVE_BRAND',
						payload: response.data.name
					})
				}
			}
		})
	}

	useEffect(() => {
		showBrand()
	}, [])

	const editModal = (
		<BrandEditModal show={show} handleClose={handleClose} filteredBrand={filteredBrand[0]} />
	)

	return (
		<div>
			<Button variant="primary" onClick={() => history.push('/brand/insert')}>
				Add Brand
			</Button>
			<Container>
				<CardColumns>
					{brand.map((key) => {
						return (
							<Card style={{ width: '18rem' }} key={key.id}>
								<Card.Img variant="top" src={baseURL + key.brand_image} alt="brand" />
								<Card.Body>
									<Card.Title>{key.name}</Card.Title>
									<Card.Text>{key.brand_description}</Card.Text>
									<Edit
										color="blue"
										style={{ cursor: 'pointer' }}
										onClick={() => editBrand(key.name)}
									/>
									&nbsp;&nbsp;
									<Trash2
										color="red"
										style={{ cursor: 'pointer' }}
										onClick={() => removeBrand(key.name)}
									/>
								</Card.Body>
							</Card>
						)
					})}
				</CardColumns>
			</Container>
			{show && editModal}
		</div>
	)
}

export default Brand
